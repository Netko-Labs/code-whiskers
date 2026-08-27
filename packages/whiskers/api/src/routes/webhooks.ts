import { createHmac, timingSafeEqual } from 'node:crypto'
import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { runReview } from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'

const logger = createLogger('whiskers-webhooks')

const REVIEWED_ACTIONS = new Set(['opened', 'synchronize', 'reopened', 'ready_for_review'])

function validSignature(raw: string, signature: string | null): boolean {
  const secret = whiskersEnvConfig.github.webhookSecret
  // Unsigned webhooks pass only in dev — prod without a secret rejects everything.
  if (!secret) return whiskersEnvConfig.app.dev
  if (!signature?.startsWith('sha256=')) return false
  const expected = createHmac('sha256', secret).update(raw).digest('hex')
  const provided = signature.slice('sha256='.length)
  if (provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'))
}

export const webhookRoutes = new Elysia({ name: 'webhooks', prefix: '/webhooks' })
  // ヽ(・∀・)ﾉ GitHub knocks — verify, ack fast, review async
  .post('/github', async ({ request, set }) => {
    const raw = await request.text()
    if (!validSignature(raw, request.headers.get('x-hub-signature-256'))) {
      set.status = 401
      return { error: 'invalid signature' }
    }
    if (request.headers.get('x-github-event') !== 'pull_request') return { ok: true }

    const payload = JSON.parse(raw) as {
      action?: string
      number?: number
      repository?: { name?: string; owner?: { login?: string } }
    }
    const owner = payload.repository?.owner?.login
    const repo = payload.repository?.name
    const prNumber = payload.number
    if (!payload.action || !REVIEWED_ACTIONS.has(payload.action) || !owner || !repo || !prNumber) {
      return { ok: true }
    }

    // Ack the webhook immediately; the review runs in the background.
    void runReview({ owner, repo, prNumber }).catch((error) => {
      logger.error(
        { err: error instanceof Error ? error.message : String(error) },
        'review crashed',
      )
    })
    return { ok: true, queued: { owner, repo, prNumber } }
  })
