import { createHmac, timingSafeEqual } from 'node:crypto'
import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { type FixTarget, isBotMention, runFix, runReview } from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'

const logger = createLogger('whiskers-webhooks')

const REVIEWED_ACTIONS = new Set(['opened', 'synchronize', 'reopened', 'ready_for_review'])
const MENTION_EVENTS = new Set(['issue_comment', 'pull_request_review_comment'])
// Fix runs spend money and push commits — only repo insiders may trigger them.
const TRUSTED_ASSOCIATIONS = new Set(['OWNER', 'MEMBER', 'COLLABORATOR'])

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

function handlePullRequest(raw: string) {
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
    logger.error({ err: error instanceof Error ? error.message : String(error) }, 'review crashed')
  })
  return { ok: true, queued: { owner, repo, prNumber } }
}

// @<botHandle> in a PR comment or a review thread queues a fix reply.
function handleMention(event: string, raw: string) {
  const payload = JSON.parse(raw) as {
    action?: string
    comment?: {
      id?: number
      body?: string
      path?: string
      line?: number | null
      start_line?: number | null
      author_association?: string
      user?: { login?: string; type?: string }
    }
    issue?: { number?: number; pull_request?: unknown }
    pull_request?: { number?: number }
    repository?: { name?: string; owner?: { login?: string } }
  }
  const owner = payload.repository?.owner?.login
  const repo = payload.repository?.name
  const prNumber = payload.pull_request?.number ?? payload.issue?.number
  const body = payload.comment?.body
  const author = payload.comment?.user?.login
  if (payload.action !== 'created' || !owner || !repo || !prNumber || !body || !author) {
    return { ok: true }
  }
  // Only PR conversations (issue_comment also fires on plain issues), never
  // other bots, only repo insiders — and only when this bot is actually mentioned.
  if (event === 'issue_comment' && !payload.issue?.pull_request) return { ok: true }
  if (payload.comment?.user?.type === 'Bot') return { ok: true }
  if (!TRUSTED_ASSOCIATIONS.has(payload.comment?.author_association ?? '')) return { ok: true }
  if (!isBotMention(body, whiskersEnvConfig.github.botHandle)) return { ok: true }

  const target: FixTarget =
    event === 'pull_request_review_comment'
      ? {
          commentId: payload.comment?.id ?? null,
          path: payload.comment?.path ?? null,
          startLine: payload.comment?.start_line ?? null,
          line: payload.comment?.line ?? null,
          body,
          author,
        }
      : { commentId: null, path: null, startLine: null, line: null, body, author }

  void runFix({ owner, repo, prNumber }, target).catch((error) => {
    logger.error({ err: error instanceof Error ? error.message : String(error) }, 'fix crashed')
  })
  return { ok: true, queued: { owner, repo, prNumber, fix: true } }
}

export const webhookRoutes = new Elysia({ name: 'webhooks', prefix: '/webhooks' })
  // ヽ(・∀・)ﾉ GitHub knocks — verify, ack fast, work async
  .post('/github', async ({ request, set }) => {
    const raw = await request.text()
    if (!validSignature(raw, request.headers.get('x-hub-signature-256'))) {
      set.status = 401
      return { error: 'invalid signature' }
    }
    const event = request.headers.get('x-github-event')
    if (event === 'pull_request') return handlePullRequest(raw)
    if (event && MENTION_EVENTS.has(event)) return handleMention(event, raw)
    return { ok: true }
  })
