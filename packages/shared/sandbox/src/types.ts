import type { ChildProcessWithoutNullStreams } from 'node:child_process'

export interface SandboxMount {
  host: string
  container: string
  readOnly?: boolean
}

export interface SandboxOptions {
  image?: string
  ttlMs?: number
  memory?: string
  cpus?: string
  network?: string
  mounts?: SandboxMount[]
  readOnlyRoot?: boolean
  tmpfs?: string[]
  user?: string
}

export interface ExecResult {
  code: number
  stdout: string
  stderr: string
}

/** Env for a spawned process: names go on the docker argv, values only into the docker client's env. */
export interface SpawnInSandbox {
  argv: string[]
  env: Record<string, string>
  workdir?: string
}

export interface Sandbox {
  id: string
  exec(command: string, opts?: { timeoutMs?: number }): Promise<ExecResult>
  writeFile(path: string, content: string): Promise<void>
  readFile(path: string): Promise<string>
  spawn(request: SpawnInSandbox): ChildProcessWithoutNullStreams
  destroy(): Promise<void>
}

export interface EgressOptions {
  allowHosts: string[]
  ttlMs?: number
}

/** An internal network whose only way out is a CONNECT proxy that admits `allowHosts` on 443. */
export interface EgressNetwork {
  network: string
  proxyUrl: string
  destroy(): Promise<void>
}

export interface ConnectTarget {
  host: string
  port: number
}

/** A loopback CONNECT proxy in this process; `url` is what HTTPS_PROXY should say. */
export interface EgressProxy {
  port: number
  url: string
  close(): Promise<void>
}
