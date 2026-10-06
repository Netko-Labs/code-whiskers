import type { ChildProcessWithoutNullStreams } from 'node:child_process'

export type CheckoutDir = {
  dir: string
  root: string
  destroy(): Promise<void>
}

export type SandboxKind = 'docker' | 'host'

export type SandboxAvailability = {
  hasDocker: boolean
  hasLinuxBinary: boolean
  hasCredentialEnv: boolean
}

/** Where an agent harness runs: a network-less container over the checkout, or the host itself. */
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
