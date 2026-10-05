import { getGithubLogin } from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const sessionRoutes = new Elysia({ name: 'session' })
  .use(authPlugin)
  // (◕ᴗ◕✿) who am i? — the current signed-in user
  .get('/me', { auth: true }, ({ user }) => user)
  // (=^-ω-^=) the GitHub login behind it — reviews name their author by it
  .get('/me/github', { auth: true }, ({ user }) => getGithubLogin(user.id))
