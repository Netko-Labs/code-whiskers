import { existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { dockerAvailable } from '@code-whiskers/sandbox'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { ReviewerStatus, WhiskersConfig } from '@code-whiskers/whiskers-domain'
import {
  AGENT_CHUNK_CHARS,
  AGENT_CONCURRENCY,
  type AgentRuntime,
  type CheckoutDir,
  CONTAINER_BIN_DIR,
  chooseSandbox,
  dockerRuntime,
  emptyCheckout,
  hostRuntime,
  openCheckout,
  PROBE_MAX_TURNS,
  PROBE_TIMEOUT_MS,
  SANDBOX_TTL_MARGIN_MS,
  type SandboxKind,
} from '../agent'
import { PROBE_DIFF } from '../constants'
import { credentialPresence, hasCredential } from '../credentials'
import type { ReviewProvider } from '../types'
import { CLAUDE_API_HOST, CLAUDE_CREDENTIALS } from './constants'
import { hostClaudeBinary, sandboxClaudeBinary } from './executable'
import { openClaudeSession } from './session'
import type { ClaudeSessionSpec } from './types'

function apiHost(): string {
  const base = process.env.ANTHROPIC_BASE_URL
  return base ? new URL(base).hostname : CLAUDE_API_HOST
}

/** The Claude Agent SDK over a read-only checkout, in the Docker sandbox when it can run there. */
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
  let hasDocker: Promise<boolean> | undefined
  const dockerAnswers = (): Promise<boolean> => {
    hasDocker ??= dockerAvailable()
    return hasDocker
  }

  const sandboxKind = async (): Promise<SandboxKind> =>
    chooseSandbox(review.sandbox, {
      hasDocker: review.sandbox !== 'host' && (await dockerAnswers()),
      hasLinuxBinary: sandboxBinary !== null && existsSync(sandboxBinary),
      hasCredentialEnv: hasCredential(CLAUDE_CREDENTIALS),
    })

  const openRuntime = async (checkout: CheckoutDir): Promise<AgentRuntime> => {
    if ((await sandboxKind()) === 'host' || !sandboxBinary) return hostRuntime(checkout)
    return dockerRuntime({
      checkout,
      image: review.sandboxImage,
      binary: sandboxBinary,
      allowHosts: [apiHost()],
      ttlMs: review.timeoutMs + SANDBOX_TTL_MARGIN_MS,
    })
  }

  const status = async (): Promise<ReviewerStatus> => {
    const credentials = credentialPresence(CLAUDE_CREDENTIALS)
    const sandbox = await sandboxKind().catch(() => null)
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
      sandbox === null && 'REVIEW_AGENT_SANDBOX=docker cannot run here: reviews will fail',
      sandbox === 'host' &&
        review.sandbox !== 'host' &&
        'no Docker sandbox (needs a daemon, a Linux binary and a credential in env): the agent runs on the host with its tools confined to the checkout',
    ].filter((problem): problem is string => typeof problem === 'string')
    return {
      provider: 'claude',
      model: review.model,
      isAgentic: true,
      credentials,
      executable: { name: 'claude', ...host },
      sandbox,
      problems,
    }
  }

  return {
    id: 'claude',
    model: review.model,
    isAgentic: true,
    chunkChars: AGENT_CHUNK_CHARS,
    concurrency: AGENT_CONCURRENCY,
    open: async (target) => openClaudeSession(spec, await openCheckout(target), openRuntime),
    probe: async (tokens) => {
      const probeSpec = {
        ...spec,
        limits: { maxTurns: PROBE_MAX_TURNS, timeoutMs: PROBE_TIMEOUT_MS },
      }
      const session = await openClaudeSession(probeSpec, await emptyCheckout(), openRuntime)
      try {
        return await session.review(PROBE_DIFF, '', tokens)
      } finally {
        await session.close()
      }
    },
    status,
  }
}
