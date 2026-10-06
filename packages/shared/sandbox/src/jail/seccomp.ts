import {
  AF_INET,
  AF_INET6,
  BPF,
  CLONE_NAMESPACE_FLAGS,
  DENIED_SYSCALLS,
  ENOSYS,
  EPERM,
  SECCOMP_DATA,
  SECCOMP_RET_ALLOW,
  SECCOMP_RET_ERRNO,
  SECCOMP_RET_KILL_PROCESS,
  SOCK_DGRAM,
  SOCK_TYPE_MASK,
  SYSCALLS,
  X32_SYSCALL_BIT,
} from './constants'
import type { BpfInstruction, SeccompArch, SyscallProbe } from './types'

const op = (code: number, k: number, jt = 0, jf = 0): BpfInstruction => ({ code, jt, jf, k })
const load = (offset: number) => op(BPF.LD_W_ABS, offset)
const ret = (value: number) => op(BPF.RET_K, value)
const refuse = (errno: number) => ret(SECCOMP_RET_ERRNO | errno)

export function seccompArch(arch: string = process.arch): SeccompArch | null {
  if (arch === 'x64') return 'x64'
  if (arch === 'arm64') return 'arm64'
  return null
}

/**
 * Deny-list filter. A foreign arch (or x32) is killed, since its numbers would dodge the list.
 * clone3 answers ENOSYS so libc falls back to clone, whose flags can be read; a clone that makes
 * namespaces and any UDP socket (DNS or otherwise; the proxy is TCP) are refused with EPERM.
 */
export function seccompProgram(arch: SeccompArch): BpfInstruction[] {
  const table = SYSCALLS[arch]
  return [
    load(SECCOMP_DATA.ARCH),
    op(BPF.JEQ_K, table.audit, 1, 0),
    ret(SECCOMP_RET_KILL_PROCESS),
    load(SECCOMP_DATA.NR),
    ...(table.hasX32 ? [op(BPF.JGE_K, X32_SYSCALL_BIT, 0, 1), ret(SECCOMP_RET_KILL_PROCESS)] : []),
    ...DENIED_SYSCALLS.flatMap((name) => [op(BPF.JEQ_K, table.denied[name], 0, 1), refuse(EPERM)]),
    op(BPF.JEQ_K, table.clone3, 0, 1),
    refuse(ENOSYS),
    op(BPF.JEQ_K, table.clone, 0, 4),
    load(SECCOMP_DATA.ARG0_LOW),
    op(BPF.JSET_K, CLONE_NAMESPACE_FLAGS, 0, 1),
    refuse(EPERM),
    ret(SECCOMP_RET_ALLOW),
    op(BPF.JEQ_K, table.socket, 0, 7),
    load(SECCOMP_DATA.ARG0_LOW),
    op(BPF.JEQ_K, AF_INET, 1, 0),
    op(BPF.JEQ_K, AF_INET6, 0, 4),
    load(SECCOMP_DATA.ARG1_LOW),
    op(BPF.AND_K, SOCK_TYPE_MASK),
    op(BPF.JEQ_K, SOCK_DGRAM, 0, 1),
    refuse(EPERM),
    ret(SECCOMP_RET_ALLOW),
  ]
}

/** `struct sock_filter[]`: u16 code, u8 jt, u8 jf, u32 k, little-endian. */
export function encodeProgram(program: BpfInstruction[]): Uint8Array {
  const bytes = new Uint8Array(program.length * 8)
  const view = new DataView(bytes.buffer)
  program.forEach(({ code, jt, jf, k }, index) => {
    view.setUint16(index * 8, code, true)
    view.setUint8(index * 8 + 2, jt)
    view.setUint8(index * 8 + 3, jf)
    view.setUint32(index * 8 + 4, k >>> 0, true)
  })
  return bytes
}

function field(call: SyscallProbe, offset: number): number {
  if (offset === SECCOMP_DATA.NR) return call.nr
  if (offset === SECCOMP_DATA.ARCH) return call.arch
  if (offset === SECCOMP_DATA.ARG0_LOW) return call.args?.[0] ?? 0
  if (offset === SECCOMP_DATA.ARG1_LOW) return call.args?.[1] ?? 0
  throw new Error(`no seccomp_data field at ${offset}`)
}

/** The kernel's evaluation of the subset of classic BPF the filter uses, for tests. */
export function evaluateProgram(program: BpfInstruction[], call: SyscallProbe): number {
  let accumulator = 0
  let pc = 0
  while (pc < program.length) {
    const { code, jt, jf, k } = program[pc] as BpfInstruction
    pc += 1
    if (code === BPF.RET_K) return k >>> 0
    if (code === BPF.LD_W_ABS) accumulator = field(call, k) >>> 0
    else if (code === BPF.AND_K) accumulator = (accumulator & k) >>> 0
    else if (code === BPF.JEQ_K) pc += accumulator === k >>> 0 ? jt : jf
    else if (code === BPF.JGE_K) pc += accumulator >= k >>> 0 ? jt : jf
    else if (code === BPF.JSET_K) pc += (accumulator & k) !== 0 ? jt : jf
    else throw new Error(`unsupported BPF op 0x${code.toString(16)}`)
  }
  throw new Error('the filter fell off its end')
}
