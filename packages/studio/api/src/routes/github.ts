import {
  getOrganizationsForUser,
  getRepositoriesForUser,
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
  // (◕‿◕) pull it fresh from GitHub — cheap enough to run on sign-in
  .post('/orgs/sync', { auth: true }, ({ user }) => syncGithubInstallations(user.id))
