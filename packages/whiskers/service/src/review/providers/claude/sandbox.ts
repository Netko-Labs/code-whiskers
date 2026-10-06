import { existsSync } from 'node:fs'
import { dockerAvailable, type JailProbe, probeJail } from '@code-whiskers/sandbox'
import type { ReviewerStatus } from '@code-whiskers/whiskers-domain'
import {
  type AgentRuntime,
  type CheckoutDir,
  chooseSandbox,
  dockerRuntime,
  hostRuntime,
  jailRuntime,
  SANDBOX_TTL_MARGIN_MS,
  type SandboxChoice,
} from '../agent'
import { hasCredential } from '../credentials'
import { CLAUDE_API_HOST, CLAUDE_CREDENTIALS } from './constants'
import type { ClaudeSandbox, ClaudeSandboxSpec } from './types'

const UNPROBED: Promise<JailProbe> = Promise.resolve({
  isUsable: false,
  landlockAbi: null,
  canDropUid: false,
  hasSeccomp: false,
  reason: 'not probed',
})

function apiHost(): string {
  const base = process.env.ANTHROPIC_BASE_URL
  return base ? new URL(base).hostname : CLAUDE_API_HOST
}

/**
 * Probes once, lazily: the jail only when the mode could pick it (a throwaway launcher tries
 * the whole sequence), Docker only when it could be next. Every runtime is per review.
 */
export function claudeSandbox({
  review,
  hostBinary,
  sandboxBinary,
}: ClaudeSandboxSpec): ClaudeSandbox {
  let jail: Promise<JailProbe> | undefined
  let docker: Promise<boolean> | undefined
  const jailProbe = () => {
    jail ??=
      review.sandbox === 'auto' || review.sandbox === 'jail' ? probeJail(review.jail.uid) : UNPROBED
    return jail
  }
  const dockerAnswers = () => {
    docker ??=
      review.sandbox === 'auto' || review.sandbox === 'docker'
        ? dockerAvailable()
        : Promise.resolve(false)
    return docker
  }

  const choose = async (): Promise<SandboxChoice> =>
    chooseSandbox(review.sandbox, {
      jail: await jailProbe(),
      hasJailBinary: process.platform === 'linux' && hostBinary !== null && existsSync(hostBinary),
      hasDocker: await dockerAnswers(),
      hasLinuxBinary: sandboxBinary !== null && existsSync(sandboxBinary),
      hasCredentialEnv: hasCredential(CLAUDE_CREDENTIALS),
    })

  const open = async (checkout: CheckoutDir): Promise<AgentRuntime> => {
    const { kind } = await choose()
    if (kind === 'jail' && hostBinary) {
      return jailRuntime({
        checkout,
        binary: hostBinary,
        allowHosts: [apiHost()],
        uid: review.jail.uid,
        limits: review.jail,
        hasSeccomp: (await jailProbe()).hasSeccomp,
      })
    }
    if (kind === 'docker' && sandboxBinary) {
      return dockerRuntime({
        checkout,
        image: review.sandboxImage,
        binary: sandboxBinary,
        allowHosts: [apiHost()],
        ttlMs: review.timeoutMs + SANDBOX_TTL_MARGIN_MS,
      })
    }
    return hostRuntime(checkout)
  }

  const isolation = async (): Promise<NonNullable<ReviewerStatus['isolation']>> => {
    const probe = review.sandbox === 'auto' || review.sandbox === 'jail' ? await jailProbe() : null
    const jailStatus = probe && {
      landlockAbi: probe.landlockAbi,
      canDropUid: probe.canDropUid,
      hasSeccomp: probe.hasSeccomp,
      reason: probe.reason,
    }
    const reason = await choose().then(
      (choice) => choice.reason,
      (error: Error) => error.message,
    )
    return { mode: review.sandbox, reason, jail: jailStatus }
  }

  return { choose, open, isolation }
}
