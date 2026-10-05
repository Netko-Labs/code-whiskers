import {
  IssueLifecycleRequestSchema,
  RecentTriageActivityQuerySchema,
  TriageAssignSchema,
  TriageCommentSchema,
  TriageDecisionSchema,
  TriageItemSchema,
} from '@code-whiskers/studio-domain'
import {
  addTriageComment,
  assignTriageItem,
  authorizeTriageScope,
  getRecentTriageActivity,
  getTriageActivity,
  getTriageComments,
  getTriageForUser,
  realtimeBus,
  recordTriageDecision,
  setIssueLifecycle,
} from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const triageRoutes = new Elysia({ name: 'triage', prefix: '/triage' })
  .use(authPlugin)
  // (•̀ᴗ•́) every decision the user can see — the console hydrates from this
  .get('', { auth: true }, ({ user }) => getTriageForUser(user.id))
  // (•̀ᴗ•́) a human's call on something whiskers said — survives the reload
  .post('', { auth: true, body: TriageDecisionSchema }, async ({ body, user, status }) => {
    const isRecorded = await recordTriageDecision(user.id, body)
    if (!isRecorded) return status(403, 'Forbidden')
    return { ok: true }
  })
  // (ﾉ◕ヮ◕)ﾉ resolve, archive or reopen a selection of issues; whiskers mirrors it
  .post(
    '/issues/lifecycle',
    { auth: true, body: IssueLifecycleRequestSchema },
    async ({ body, user, status }) => {
      const result = await setIssueLifecycle(user.id, body)
      if (!result) return status(403, 'Forbidden')
      realtimeBus.publish(['issues'])
      return result
    },
  )
  // (ง •̀_•́)ง hand it (or a selection) to a teammate, or take it back
  .post('/assign', { auth: true, body: TriageAssignSchema }, async ({ body, user, status }) => {
    const isAssigned = await assignTriageItem(user.id, body)
    if (!isAssigned) return status(403, 'Forbidden')
    return { ok: true }
  })
  // (｡･ω･｡) the conversation on one item
  .get('/comments', { auth: true, query: TriageItemSchema }, async ({ query, user, status }) => {
    const authorized = await authorizeTriageScope(user.id, query.scope)
    if (!authorized) return status(403, 'Forbidden')
    return getTriageComments({ ...query, scope: authorized.scope })
  })
  // (｡･ω･｡) what happened to one item, comments in place, oldest first
  .get('/activity', { auth: true, query: TriageItemSchema }, async ({ query, user, status }) => {
    const authorized = await authorizeTriageScope(user.id, query.scope)
    if (!authorized) return status(403, 'Forbidden')
    return getTriageActivity({ ...query, scope: authorized.scope })
  })
  // (｡･ω･｡) what just happened anywhere the user can see — the overview's feed
  .get(
    '/activity/recent',
    { auth: true, query: RecentTriageActivityQuerySchema },
    ({ query, user }) => getRecentTriageActivity(user.id, query.limit),
  )
  .post('/comments', { auth: true, body: TriageCommentSchema }, async ({ body, user, status }) => {
    const created = await addTriageComment(user.id, body)
    if (!created) return status(403, 'Forbidden')
    return created
  })
