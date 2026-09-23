import { studioEnvConfig } from '@code-whiskers/studio-config'
import { getStudioStorage } from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

const { appSlug } = studioEnvConfig.github

export const instanceRoutes = new Elysia({ name: 'instance', prefix: '/instance' })
  .use(authPlugin)
  // (￣ω￣) what this particular self-hosted instance is wired to
  .get('', { auth: true }, () => ({
    githubApp: {
      slug: appSlug,
      url: `https://github.com/apps/${appSlug}`,
      installUrl: `https://github.com/apps/${appSlug}/installations/new`,
    },
  }))
  // (￣ー￣) studio's side of the storage picture; whiskers answers /v1/instance for its own
  .get('/storage', { auth: true }, () => getStudioStorage())
