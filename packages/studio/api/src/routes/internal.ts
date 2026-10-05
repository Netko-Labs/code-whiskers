import { timingSafeEqual } from 'node:crypto'
import { studioEnvConfig } from '@code-whiskers/studio-config'
import {
  AlertFireSchema,
  FindingDismissSchema,
  IdParamSchema,
  IssueTransitionBodySchema,
  RealtimeEventsSchema,
} from '@code-whiskers/studio-domain'
import {
  dismissFinding,
  fireAlertRule,
  getEvaluableRules,
  getRepositoryWatch,
  getRulesForRepository,
  getSuppressions,
  quietAlertRule,
  realtimeBus,
  recordIssueTransition,
} from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'

/**
 * The whiskers → studio direction. Studio fronts the public hostname, so this
 * surface is reachable from the internet and needs real auth rather than
 * network trust. A shared token rather than the JWT used the other way: whiskers
 * has no keypair studio could verify against, and minting one for a
 * single-operator tool is ceremony without a threat it answers.
 *
 * An unset token leaves the surface closed rather than open.
 */
function authorized(header: string | undefined): boolean {
  const expected = studioEnvConfig.whiskers.internalToken
  if (!expected) return false
  const provided = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
  if (provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

export const internalRoutes = new Elysia({ name: 'internal', prefix: '/internal' })
  // (ﾉ´ヮ`)ﾉ*: whiskers changed something; open consoles refetch it
  .post('/events', { body: RealtimeEventsSchema }, ({ headers, body, status }) => {
    if (!authorized(headers.authorization)) return status(401, 'Unauthorized')
    realtimeBus.publish(body.topics)
    return { ok: true }
  })
  // (ﾟДﾟ;) ingest reopened an issue a human had resolved or archived
  .post(
    '/issues/transition',
    { body: IssueTransitionBodySchema },
    async ({ headers, body, status }) => {
      if (!authorized(headers.authorization)) return status(401, 'Unauthorized')
      await recordIssueTransition(body)
      realtimeBus.publish(['issues'])
      return { ok: true }
    },
  )
  // ʕ·ᴥ·ʔ what has a human already argued with on this repo?
  .get('/suppressions', async ({ headers, query, set, status }) => {
    if (!authorized(headers.authorization)) return status(401, 'Unauthorized')
    const scope = typeof query.scope === 'string' ? query.scope : ''
    if (!scope) return status(400, 'scope is required')
    const { suppressions, isTruncated } = await getSuppressions(scope)
    // A header, not a wrapper object, so a whiskers still reading a bare array keeps working.
    if (isTruncated) set.headers['x-suppressions-truncated'] = 'true'
    return suppressions
  })
  // (￣ー￣)ゞ an insider said `@code-whiskers ignore` on one of the reviewer's threads
  .post('/findings/dismiss', { body: FindingDismissSchema }, async ({ headers, body, status }) => {
    if (!authorized(headers.authorization)) return status(401, 'Unauthorized')
    if (!(await dismissFinding(body))) return status(404, 'Not found')
    return { ok: true }
  })
  // (｀・ω・´) the team's rules for the installation this repo belongs to
  .get('/rules', async ({ headers, query, status }) => {
    if (!authorized(headers.authorization)) return status(401, 'Unauthorized')
    const repo = typeof query.repo === 'string' ? query.repo : ''
    if (!repo) return status(400, 'repo is required')
    return getRulesForRepository(repo)
  })
  // (ﾟДﾟ;) the conditions to evaluate — never where they are delivered
  .get('/alert-rules', ({ headers, status }) => {
    if (!authorized(headers.authorization)) return status(401, 'Unauthorized')
    return getEvaluableRules()
  })
  // (ﾟДﾟ;) a condition held: studio delivers, whiskers never sees a webhook URL
  .post(
    '/alert-rules/:id/fire',
    { params: IdParamSchema, body: AlertFireSchema },
    async ({ headers, params, body, status }) => {
      if (!authorized(headers.authorization)) return status(401, 'Unauthorized')
      const result = await fireAlertRule(params.id, body)
      if (!result) return status(404, 'Not found')
      return result
    },
  )
  .post(
    '/alert-rules/:id/quiet',
    { params: IdParamSchema },
    async ({ headers, params, status }) => {
      if (!authorized(headers.authorization)) return status(401, 'Unauthorized')
      await quietAlertRule(params.id)
      return { ok: true }
    },
  )
  // (｡-ω-)zzz should the reviewer run on this repository?
  .get('/repository', async ({ headers, query, status }) => {
    if (!authorized(headers.authorization)) return status(401, 'Unauthorized')
    const repo = typeof query.repo === 'string' ? query.repo : ''
    const isWatched = repo ? await getRepositoryWatch(repo) : null
    if (isWatched === null) return status(404, 'Not found')
    return { isWatched }
  })
