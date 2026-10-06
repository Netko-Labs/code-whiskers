import { dlopen, FFIType, ptr, read } from 'bun:ffi'
import { LIBC_CANDIDATES } from './constants'

const { i32, i64, u32, u64 } = FFIType

const SYMBOLS = {
  syscall: { args: [i64, u64, u64, u64, u64, u64], returns: i64 },
  setrlimit: { args: [i32, FFIType.ptr], returns: i32 },
  setgroups: { args: [u64, u64], returns: i32 },
  setresgid: { args: [u32, u32, u32], returns: i32 },
  setresuid: { args: [u32, u32, u32], returns: i32 },
  getuid: { args: [], returns: u32 },
  open: { args: [FFIType.ptr, i32, u32], returns: i32 },
  close: { args: [i32], returns: i32 },
  execve: { args: [FFIType.ptr, FFIType.ptr, FFIType.ptr], returns: i32 },
  // biome-ignore lint/style/useNamingConvention: the C symbol
  __errno_location: { args: [], returns: FFIType.ptr },
} as const

function openLibc() {
  const errors: string[] = []
  for (const name of LIBC_CANDIDATES) {
    try {
      return dlopen(name, SYMBOLS).symbols
    } catch (error) {
      errors.push(`${name}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  throw new Error(`no libc to load: ${errors.join('; ')}`)
}

let symbols: ReturnType<typeof openLibc> | undefined
const libc = () => {
  symbols ??= openLibc()
  return symbols
}

export class SyscallError extends Error {
  readonly errno: number
  constructor(step: string, errno: number) {
    super(`${step} failed (errno ${errno})`)
    this.errno = errno
  }
}

function errno(): number {
  const location = libc().__errno_location()
  return location === null ? 0 : read.i32(location, 0)
}

/** A libc or raw syscall result: negative means failed, with errno read before anything else runs. */
function check(step: string, result: number | bigint): number {
  const value = Number(result)
  if (value < 0) throw new SyscallError(step, errno())
  return value
}

export const cString = (text: string): Buffer => Buffer.from(`${text}\0`)
export const address = (bytes: NodeJS.TypedArray): bigint => BigInt(ptr(bytes))

export function syscall(step: string, nr: number, ...args: (number | bigint)[]): number {
  const [a = 0, b = 0, c = 0, d = 0, e = 0] = args
  return check(step, libc().syscall(nr, a, b, c, d, e))
}

export function setrlimit(resource: number, limit: bigint): void {
  check(`setrlimit(${resource})`, libc().setrlimit(resource, new BigUint64Array([limit, limit])))
}

/** Supplementary groups first, then gid, then uid: each step needs the privilege the next drops. */
export function dropTo(uid: number, gid: number): void {
  check('setgroups', libc().setgroups(0, 0))
  check('setresgid', libc().setresgid(gid, gid, gid))
  check('setresuid', libc().setresuid(uid, uid, uid))
}

export function regainsRoot(): boolean {
  return libc().setresuid(0, 0, 0) === 0
}

export function getuid(): number {
  return libc().getuid()
}

export function openPath(path: string, flags: number): number {
  return check(`open ${path}`, libc().open(cString(path), flags, 0))
}

export function close(fd: number): void {
  libc().close(fd)
}

/** Replaces this process; returns only by throwing. */
export function execve(path: string, argv: string[], env: Record<string, string>): never {
  const strings = (list: string[]) => list.map(cString)
  const table = (buffers: Buffer[]) =>
    new BigUint64Array([...buffers.map((buffer) => address(buffer)), 0n])
  const args = strings(argv)
  const vars = strings(Object.entries(env).map(([name, value]) => `${name}=${value}`))
  check(`execve ${path}`, libc().execve(cString(path), table(args), table(vars)))
  throw new SyscallError(`execve ${path}`, errno())
}
