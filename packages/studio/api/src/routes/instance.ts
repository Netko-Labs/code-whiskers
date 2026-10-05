import { studioEnvConfig } from '@code-whiskers/studio-config'
import { InstanceSettingsSchema } from '@code-whiskers/studio-domain'
import {
  getInstanceSettings,
  getStudioStorage,
  hasInstanceAccess,
  probeWhiskers,
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
