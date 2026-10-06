import type { DeniedSyscall } from './constants'

/** `read`: list and open. `exec`: also execute. `write`: own the subtree. `device`: read/write one node. */
export type PathAccess = 'read' | 'exec' | 'write' | 'device'

export type PathGrant = {
  path: string
  access: PathAccess
}

/** Zero or absent means no limit of that kind. */
export type JailLimits = {
  cpuSeconds: number
  memoryMb: number
  processes: number
  fileSizeMb: number
  openFiles: number
}

/** Everything the launcher applies before it becomes the harness. Paths only, never a value. */
export type JailPolicy = {
  uid: number
  gid: number
  cwd: string
  grants: PathGrant[]
  connectPorts: number[]
  limits: JailLimits
  hasSeccomp: boolean
}

export type JailPolicyInput = {
  checkout: string
  binary: string
  home: string
  proxyPort: number
  uid?: number
  limits?: Partial<JailLimits>
  extraGrants?: PathGrant[]
  hasSeccomp?: boolean
}

export type LandlockRights = {
  fs: bigint
  net: bigint
  scoped: bigint
}

export type FsRule = {
  path: string
  access: bigint
}

export type SyscallTable = {
  audit: number
  seccomp: number
  prctl: number
  clone: number
  clone3: number
  socket: number
  hasX32: boolean
  denied: Record<DeniedSyscall, number>
}

export type SeccompArch = 'x64' | 'arm64'

export type BpfInstruction = {
  code: number
  jt: number
  jf: number
  k: number
}

/** What a filter sees of one syscall: the arch it came through and the low halves of two args. */
export type SyscallProbe = {
  arch: number
  nr: number
  args?: [number, number]
}

/** Whether this kernel and container let a child jail itself, step by step. */
export type JailProbe = {
  isUsable: boolean
  landlockAbi: number | null
  canDropUid: boolean
  hasSeccomp: boolean
  reason: string | null
}

export type JailSpawnRequest = {
  policy: JailPolicy
  argv: string[]
  env: Record<string, string>
  launcherCwd: string
}
