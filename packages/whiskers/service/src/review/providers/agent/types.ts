import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import type { JailLimits, JailProbe } from '@code-whiskers/sandbox'
import type { WhiskersConfig } from '@code-whiskers/whiskers-domain'

export type CheckoutDir = {
  dir: string
  root: string
  destroy(): Promise<void>
}

export type SandboxKind = 'jail' | 'docker' | 'host'
export type SandboxMode = WhiskersConfig['review']['sandbox']

export type SandboxAvailability = {
  jail: Pick<JailProbe, 'isUsable' | 'reason'>
  hasJailBinary: boolean
  hasDocker: boolean
  hasLinuxBinary: boolean
  hasCredentialEnv: boolean
}

export type SandboxChoice = {
  kind: SandboxKind
  reason: string
}

/** Where an agent harness runs: jailed on this kernel, in a container, or on the host itself. */
export interface AgentRuntime {
  kind: SandboxKind
  workdir: string
  isInside(path: string): Promise<boolean>
  spawn: ((argv: string[], env: Record<string, string>) => ChildProcessWithoutNullStreams) | null
  destroy(): Promise<void>
}

export type DockerRuntimeOptions = {
  checkout: CheckoutDir
  image: string
  binary: string
  allowHosts: string[]
  ttlMs: number
}

export type JailRuntimeOptions = {
  checkout: CheckoutDir
  binary: string
  allowHosts: string[]
  uid: number
  limits: JailLimits
  hasSeccomp: boolean
}

export type OutputTail = {
  push(text: string): void
  text(): string
}
