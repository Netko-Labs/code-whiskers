import { existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { ReviewerStatus, WhiskersConfig } from '@code-whiskers/whiskers-domain'
import {
  AGENT_CHUNK_CHARS,
  AGENT_CONCURRENCY,
  CONTAINER_BIN_DIR,
  emptyCheckout,
  openCheckout,
  PROBE_MAX_TURNS,
  PROBE_TIMEOUT_MS,
  type SandboxChoice,
} from '../agent'
import { PROBE_DIFF } from '../constants'
import { credentialPresence } from '../credentials'
import type { ReviewProvider } from '../types'
import { CLAUDE_CREDENTIALS } from './constants'
import { hostClaudeBinary, sandboxClaudeBinary } from './executable'
import { claudeSandbox } from './sandbox'
import { openClaudeSession } from './session'
import type { ClaudeSessionSpec } from './types'

/** The Claude Agent SDK over a read-only checkout, jailed or containerised when it can be. */
export function createClaudeProvider(config: WhiskersConfig = whiskersEnvConfig): ReviewProvider {
  const review = config.review
  const isDev = config.app.dev
  const host = hostClaudeBinary(review.claudeExecutable)
  const sandboxBinary = sandboxClaudeBinary(review.sandboxExecutable, host)
  const spec: ClaudeSessionSpec = {
    config: review,
    limits: review,
    isDev,
    hostBinary: host.path,
    containerBinary: sandboxBinary ? join(CONTAINER_BIN_DIR, basename(sandboxBinary)) : null,
  }
  const sandbox = claudeSandbox({ review, hostBinary: host.path, sandboxBinary })

  const status = async (): Promise<ReviewerStatus> => {
    const credentials = credentialPresence(CLAUDE_CREDENTIALS)
    const choice: SandboxChoice | null = await sandbox.choose().catch(() => null)
    const isolation = await sandbox.isolation()
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
      choice === null && `${isolation.reason}: reviews will fail`,
      choice?.kind === 'host' &&
        review.sandbox !== 'host' &&
        `no sandbox (${isolation.reason}): the agent runs on the host with its tools confined to the checkout`,
    ].filter((problem): problem is string => typeof problem === 'string')
    return {
      provider: 'claude',
      model: review.model,
      isAgentic: true,
      credentials,
      executable: { name: 'claude', ...host },
      sandbox: choice?.kind ?? null,
      isolation,
      problems,
    }
  }

  return {
    id: 'claude',
    model: review.model,
    isAgentic: true,
    chunkChars: AGENT_CHUNK_CHARS,
    concurrency: AGENT_CONCURRENCY,
    open: async (target) => openClaudeSession(spec, await openCheckout(target), sandbox.open),
    probe: async (tokens) => {
      const probeSpec = {
        ...spec,
        limits: { maxTurns: PROBE_MAX_TURNS, timeoutMs: PROBE_TIMEOUT_MS },
      }
      const session = await openClaudeSession(probeSpec, await emptyCheckout(), sandbox.open)
      try {
        return await session.review(PROBE_DIFF, '', tokens)
      } finally {
        await session.close()
      }
    },
    status,
  }
}
