import { RepositoryIdParamSchema, RepositoryWatchSchema } from '@code-whiskers/studio-domain'
import {
  getOrganizationsForUser,
  getRepositoriesForUser,
  setRepositoryWatched,
  syncGithubInstallations,
} from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const githubRoutes = new Elysia({ name: 'github' })
  .use(authPlugin)
  // ʕ•ᴥ•ʔ the installations this user can see
  .get('/orgs', { auth: true }, ({ user }) => getOrganizationsForUser(user.id))
  // (=^･ω･^=) every repository under those installations
  .get('/repositories', { auth: true }, ({ user }) => getRepositoriesForUser(user.id))
  // (｡-ω-)zzz pause or resume reviews on one repository
  .patch(
    '/repositories/:id',
    { auth: true, params: RepositoryIdParamSchema, body: RepositoryWatchSchema },
    async ({ params, body, user, status }) => {
      if (!(await setRepositoryWatched(user.id, params.id, body.isWatched))) {
        return status(404, 'Not found')
      }
      return { ok: true }
    },
  )
  // (◕‿◕) pull it fresh from GitHub — cheap enough to run on sign-in
  .post('/orgs/sync', { auth: true }, ({ user }) => syncGithubInstallations(user.id))
