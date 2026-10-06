import { existsSync } from 'node:fs'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { ReviewerStatus, WhiskersConfig } from '@code-whiskers/whiskers-domain'
import {
  AGENT_CHUNK_CHARS,
  AGENT_CONCURRENCY,
  emptyCheckout,
  openCheckout,
  PROBE_MAX_TURNS,
  PROBE_TIMEOUT_MS,
} from '../agent'
import { PROBE_DIFF } from '../constants'
import { credentialPresence } from '../credentials'
import type { ReviewProvider } from '../types'
import { CLAUDE_CREDENTIALS } from './constants'
import { hostClaudeBinary } from './executable'
import { openClaudeSession } from './session'
import type { ClaudeSessionSpec } from './types'

/** The Claude Agent SDK over a read-only checkout: three read tools, confined to the checkout. */
export function createClaudeProvider(config: WhiskersConfig = whiskersEnvConfig): ReviewProvider {
  const review = config.review
  const isDev = config.app.dev
  const host = hostClaudeBinary(review.claudeExecutable)
  const spec: ClaudeSessionSpec = { config: review, limits: review, isDev, binary: host.path }

  const status = async (): Promise<ReviewerStatus> => {
    const credentials = credentialPresence(CLAUDE_CREDENTIALS)
    const problems = [
      !credentials.some((c) => c.isSet) &&
        (isDev
          ? 'no CLAUDE_CODE_OAUTH_TOKEN or ANTHROPIC_API_KEY: using this machine’s Claude Code login'
          : 'set CLAUDE_CODE_OAUTH_TOKEN (from `claude setup-token`) or ANTHROPIC_API_KEY'),
      host.source === 'missing' && 'no Claude Code binary: set CLAUDE_CODE_EXECUTABLE or rebuild',
      host.source === 'env' &&
        host.path !== null &&
        !existsSync(host.path) &&
        'CLAUDE_CODE_EXECUTABLE points at a missing file',
    ].filter((problem): problem is string => typeof problem === 'string')
    return {
      provider: 'claude',
      model: review.model,
      isAgentic: true,
      credentials,
      executable: { name: 'claude', ...host },
      problems,
    }
  }

  return {
    id: 'claude',
    model: review.model,
    isAgentic: true,
    chunkChars: AGENT_CHUNK_CHARS,
    concurrency: AGENT_CONCURRENCY,
    open: async (target) => openClaudeSession(spec, await openCheckout(target)),
    probe: async (tokens) => {
      const probeSpec = {
        ...spec,
        limits: { maxTurns: PROBE_MAX_TURNS, timeoutMs: PROBE_TIMEOUT_MS },
      }
      const session = await openClaudeSession(probeSpec, await emptyCheckout())
      try {
        return await session.review(PROBE_DIFF, '', tokens)
      } finally {
        await session.close()
      }
    },
    status,
  }
}
