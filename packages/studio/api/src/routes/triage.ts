import {
  TriageAssignSchema,
  TriageCommentSchema,
  TriageDecisionSchema,
  TriageItemSchema,
} from '@code-whiskers/studio-domain'
import {
  addTriageComment,
  assignTriageItem,
  authorizeTriageScope,
  getTriageComments,
  getTriageForUser,
  recordTriageDecision,
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
  // (ง •̀_•́)ง hand it to a teammate, or take it back
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
  .post('/comments', { auth: true, body: TriageCommentSchema }, async ({ body, user, status }) => {
    const created = await addTriageComment(user.id, body)
    if (!created) return status(403, 'Forbidden')
    return created
  })
