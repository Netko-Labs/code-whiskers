import { getMembersForUser } from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const memberRoutes = new Elysia({ name: 'members' })
  .use(authPlugin)
  // (ﾉ◕ヮ◕)ﾉ everyone who shares an installation with you
  .get('/members', { auth: true }, ({ user }) => getMembersForUser(user.id))
