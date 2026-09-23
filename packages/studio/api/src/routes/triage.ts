import { recordTriageDecision } from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { z } from 'zod'
import { authPlugin } from '../setup'

const triageBody = z.object({
  scope: z.string().min(1),
  itemKind: z.enum(['issue', 'review', 'log', 'finding']),
  itemRef: z.string().min(1),
  status: z.enum(['open', 'resolved', 'snoozed', 'tracked', 'approved', 'dismissed']),
  note: z.string().max(500).optional(),
  assigneeUserId: z.string().optional(),
  snoozedUntil: z.coerce.date().optional(),
})

export const triageRoutes = new Elysia({ name: 'triage' })
  .use(authPlugin)
  // (•̀ᴗ•́) a human's call on something whiskers said — survives the reload
  .post('/triage', { auth: true, body: triageBody }, async ({ body, user, status }) => {
    const isRecorded = await recordTriageDecision(user.id, body)
    if (!isRecorded) return status(403, 'Forbidden')
    return { ok: true }
  })
