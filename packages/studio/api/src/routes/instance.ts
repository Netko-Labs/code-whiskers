import { studioEnvConfig } from '@code-whiskers/studio-config'
import { InstanceSettingsSchema } from '@code-whiskers/studio-domain'
import {
  getInstanceSettings,
  getStudioStorage,
  hasInstanceAccess,
  probeWhiskers,
  reviewerInWhiskers,
  testReviewerInWhiskers,
  updateInstanceSettings,
} from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

const { appSlug } = studioEnvConfig.github
const { release, environment } = studioEnvConfig.observability

export const instanceRoutes = new Elysia({ name: 'instance', prefix: '/instance' })
  .use(authPlugin)
  // (￣ω￣) what this particular self-hosted instance is wired to
  .get('', { auth: true }, async () => ({
    ...(await getInstanceSettings()),
    baseUrl: studioEnvConfig.app.baseUrl,
    release,
    environment,
    githubApp: {
      slug: appSlug,
      url: `https://github.com/apps/${appSlug}`,
      installUrl: `https://github.com/apps/${appSlug}/installations/new`,
    },
  }))
  // (｀・ω・´) rename it — anyone who can read the worker's data runs the instance
  .patch('', { auth: true, body: InstanceSettingsSchema }, async ({ body, user, status }) => {
    if (!(await hasInstanceAccess(user.id))) return status(403, 'Forbidden')
    return updateInstanceSettings(user.id, body)
  })
  // (・・ )? is the worker answering
  .get('/health', { auth: true }, () => probeWhiskers())
  // (￣ー￣) studio's side of the storage picture; whiskers answers /v1/instance for its own
  .get('/storage', { auth: true }, () => getStudioStorage())
  // (・ω・) which AI reviewer the worker runs; credentials as presence flags only
  .get('/reviewer', { auth: true }, async ({ status }) => {
    const reviewer = await reviewerInWhiskers()
    return (
      reviewer ?? status(502, 'Whiskers did not answer — check WHISKERS_URL and INTERNAL_TOKEN')
    )
  })
  // (｀・ω・´) one tiny review through it — it spends a few tokens, so instance access only
  .post('/reviewer/test', { auth: true }, async ({ user, status }) => {
    if (!(await hasInstanceAccess(user.id))) return status(403, 'Forbidden')
    const result = await testReviewerInWhiskers()
    return result ?? status(502, 'Whiskers did not answer — check WHISKERS_URL and INTERNAL_TOKEN')
  })
