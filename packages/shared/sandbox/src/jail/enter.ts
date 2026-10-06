import { statSync } from 'node:fs'
import {
  CLOSE_RANGE_CLOEXEC,
  LANDLOCK_CREATE_RULESET_VERSION,
  LANDLOCK_RULE_NET_PORT,
  LANDLOCK_RULE_PATH_BENEATH,
  MIN_LANDLOCK_ABI,
  O_CLOEXEC,
  O_PATH,
  PR_SET_NO_NEW_PRIVS,
  RLIMIT,
  SECCOMP_FILTER_FLAG_TSYNC,
  SECCOMP_SET_MODE_FILTER,
  SYS_CLOSE_RANGE,
  SYS_LANDLOCK_ADD_RULE,
  SYS_LANDLOCK_CREATE_RULESET,
  SYS_LANDLOCK_RESTRICT_SELF,
  SYSCALLS,
} from './constants'
import { connectRight, handledRights, ruleAccess, rulesetAttrSize } from './landlock'
import { address, close, dropTo, getuid, openPath, regainsRoot, setrlimit, syscall } from './libc'
import { encodeProgram, seccompArch, seccompProgram } from './seccomp'
import type { FsRule, JailLimits, JailPolicy } from './types'

const MB = 1024n * 1024n

export function landlockAbi(): number {
  try {
    return syscall(
      'landlock ABI',
      SYS_LANDLOCK_CREATE_RULESET,
      0,
      0,
      LANDLOCK_CREATE_RULESET_VERSION,
    )
  } catch {
    return 0
  }
}

/** Raw `prctl`: the libc one is variadic. No exec after this can gain privileges. */
export function noNewPrivileges(): void {
  const arch = seccompArch()
  if (!arch) throw new Error(`no prctl number for ${process.arch}`)
  syscall('prctl(NO_NEW_PRIVS)', SYSCALLS[arch].prctl, PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0)
}

/** Dropping to `uid` only happens as root; it must stick, or the jail would keep root's reach. */
export function dropPrivileges({ uid, gid }: Pick<JailPolicy, 'uid' | 'gid'>): boolean {
  if (getuid() !== 0) return false
  dropTo(uid, gid)
  if (getuid() !== uid) throw new Error('uid did not change')
  if (regainsRoot()) throw new Error('root could be regained after dropping it')
  return true
}

/** Hard and soft alike, so the harness cannot raise them back. Core dumps would carry the token. */
export function applyLimits(limits: JailLimits): void {
  const set = (resource: number, value: bigint) => value > 0n && setrlimit(resource, value)
  setrlimit(RLIMIT.CORE, 0n)
  set(RLIMIT.CPU, BigInt(limits.cpuSeconds))
  set(RLIMIT.DATA, BigInt(limits.memoryMb) * MB)
  set(RLIMIT.NPROC, BigInt(limits.processes))
  set(RLIMIT.FSIZE, BigInt(limits.fileSizeMb) * MB)
  set(RLIMIT.NOFILE, BigInt(limits.openFiles))
}

/** Grants whose path exists, masked for what each is: a missing optional path is no error. */
export function fsRules(policy: JailPolicy, handledFs: bigint): FsRule[] {
  return policy.grants.flatMap(({ path, access }) => {
    const stat = statSync(path, { throwIfNoEntry: false })
    if (!stat) return []
    return [{ path, access: ruleAccess(access, stat.isDirectory(), handledFs) }]
  })
}

function addPathRule(ruleset: number, rule: FsRule): void {
  const fd = openPath(rule.path, O_PATH | O_CLOEXEC)
  try {
    const attr = new Uint8Array(12)
    const view = new DataView(attr.buffer)
    view.setBigUint64(0, rule.access, true)
    view.setInt32(8, fd, true)
    syscall(
      `landlock rule ${rule.path}`,
      SYS_LANDLOCK_ADD_RULE,
      ruleset,
      LANDLOCK_RULE_PATH_BENEATH,
      address(attr),
      0,
    )
  } finally {
    close(fd)
  }
}

function addPortRule(ruleset: number, access: bigint, port: number): void {
  const attr = new BigUint64Array([access, BigInt(port)])
  syscall(
    `landlock port ${port}`,
    SYS_LANDLOCK_ADD_RULE,
    ruleset,
    LANDLOCK_RULE_NET_PORT,
    address(attr),
    0,
  )
}

/** Everything the ABI can restrict is handled; only the policy's grants and ports are let through. */
export function applyLandlock(policy: JailPolicy, abi: number): void {
  if (abi < MIN_LANDLOCK_ABI) throw new Error(`Landlock ABI ${abi} has no network rules`)
  const handled = handledRights(abi)
  const attr = new BigUint64Array([handled.fs, handled.net, handled.scoped])
  const ruleset = syscall(
    'landlock ruleset',
    SYS_LANDLOCK_CREATE_RULESET,
    address(attr),
    rulesetAttrSize(abi),
    0,
  )
  try {
    for (const rule of fsRules(policy, handled.fs)) addPathRule(ruleset, rule)
    const connect = connectRight(handled.net)
    for (const port of policy.connectPorts) addPortRule(ruleset, connect, port)
    syscall('landlock restrict', SYS_LANDLOCK_RESTRICT_SELF, ruleset, 0)
  } finally {
    close(ruleset)
  }
}

export function applySeccomp(): void {
  const arch = seccompArch()
  if (!arch) throw new Error(`no seccomp filter for ${process.arch}`)
  const program = seccompProgram(arch)
  const filter = encodeProgram(program)
  const fprog = new Uint8Array(16)
  const view = new DataView(fprog.buffer)
  view.setUint16(0, program.length, true)
  view.setBigUint64(8, address(filter), true)
  syscall(
    'seccomp',
    SYSCALLS[arch].seccomp,
    SECCOMP_SET_MODE_FILTER,
    SECCOMP_FILTER_FLAG_TSYNC,
    address(fprog),
  )
}

/**
 * uid → no-new-privs → limits → Landlock → seccomp, in that order: each later step is
 * unprivileged, and nothing after the uid drop could undo it.
 */
export function enterJail(policy: JailPolicy): void {
  const abi = landlockAbi()
  dropPrivileges(policy)
  process.chdir(policy.cwd)
  noNewPrivileges()
  applyLimits(policy.limits)
  applyLandlock(policy, abi)
  if (policy.hasSeccomp) applySeccomp()
}

/** Nothing the launcher opened survives into the harness but stdio. */
export function closeInheritedFds(): void {
  syscall('close_range', SYS_CLOSE_RANGE, 3, 0xffffffff, CLOSE_RANGE_CLOEXEC)
}
