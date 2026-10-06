import type { JailLimits, PathGrant, SyscallTable } from './types'

export const MIN_LANDLOCK_ABI = 4
export const NOBODY_UID = 65534

export const DEFAULT_JAIL_LIMITS: JailLimits = {
  cpuSeconds: 1_200,
  memoryMb: 8_192,
  processes: 512,
  fileSizeMb: 256,
  openFiles: 4_096,
}

/** What the harness binary needs from the image to start, resolve, and speak TLS. Missing ones are skipped. */
export const SYSTEM_GRANTS: readonly PathGrant[] = [
  { path: '/usr', access: 'exec' },
  { path: '/lib', access: 'exec' },
  { path: '/lib64', access: 'exec' },
  { path: '/lib32', access: 'exec' },
  { path: '/bin', access: 'exec' },
  { path: '/etc/ld.so.cache', access: 'read' },
  { path: '/etc/ssl', access: 'read' },
  { path: '/etc/ca-certificates', access: 'read' },
  { path: '/etc/pki', access: 'read' },
  { path: '/etc/resolv.conf', access: 'read' },
  { path: '/etc/hosts', access: 'read' },
  { path: '/etc/nsswitch.conf', access: 'read' },
  { path: '/etc/host.conf', access: 'read' },
  { path: '/etc/gai.conf', access: 'read' },
  { path: '/etc/passwd', access: 'read' },
  { path: '/etc/group', access: 'read' },
  { path: '/etc/localtime', access: 'read' },
  { path: '/proc/self', access: 'read' },
  { path: '/proc/cpuinfo', access: 'read' },
  { path: '/proc/meminfo', access: 'read' },
  { path: '/proc/stat', access: 'read' },
  { path: '/sys/fs/cgroup', access: 'read' },
  { path: '/sys/devices/system/cpu', access: 'read' },
  { path: '/dev/null', access: 'device' },
  { path: '/dev/zero', access: 'device' },
  { path: '/dev/full', access: 'device' },
  { path: '/dev/random', access: 'device' },
  { path: '/dev/urandom', access: 'device' },
]

export const SYS_LANDLOCK_CREATE_RULESET = 444
export const SYS_LANDLOCK_ADD_RULE = 445
export const SYS_LANDLOCK_RESTRICT_SELF = 446
export const SYS_CLOSE_RANGE = 436
export const LANDLOCK_CREATE_RULESET_VERSION = 1
export const LANDLOCK_RULE_PATH_BENEATH = 1
export const LANDLOCK_RULE_NET_PORT = 2
export const CLOSE_RANGE_CLOEXEC = 4

/** `include/uapi/linux/landlock.h`, bit by bit. */
export const FS = {
  EXECUTE: 1n << 0n,
  WRITE_FILE: 1n << 1n,
  READ_FILE: 1n << 2n,
  READ_DIR: 1n << 3n,
  REMOVE_DIR: 1n << 4n,
  REMOVE_FILE: 1n << 5n,
  MAKE_CHAR: 1n << 6n,
  MAKE_DIR: 1n << 7n,
  MAKE_REG: 1n << 8n,
  MAKE_SOCK: 1n << 9n,
  MAKE_FIFO: 1n << 10n,
  MAKE_BLOCK: 1n << 11n,
  MAKE_SYM: 1n << 12n,
  REFER: 1n << 13n,
  TRUNCATE: 1n << 14n,
  IOCTL_DEV: 1n << 15n,
  RESOLVE_UNIX: 1n << 16n,
} as const

export const NET = {
  BIND_TCP: 1n << 0n,
  CONNECT_TCP: 1n << 1n,
  BIND_UDP: 1n << 2n,
  CONNECT_SEND_UDP: 1n << 3n,
} as const

export const SCOPE = {
  ABSTRACT_UNIX_SOCKET: 1n << 0n,
  SIGNAL: 1n << 1n,
} as const

/** The rights the kernel accepts on a rule for a file rather than a directory. */
export const FS_FILE_RIGHTS = FS.EXECUTE | FS.WRITE_FILE | FS.READ_FILE | FS.TRUNCATE | FS.IOCTL_DEV

/** ABI → what it added. A right newer than the running kernel is left out, not refused. */
export const FS_RIGHTS_SINCE: readonly [abi: number, rights: bigint][] = [
  [1, (1n << 13n) - 1n],
  [2, FS.REFER],
  [3, FS.TRUNCATE],
  [5, FS.IOCTL_DEV],
  [9, FS.RESOLVE_UNIX],
]
export const NET_RIGHTS_SINCE: readonly [abi: number, rights: bigint][] = [
  [4, NET.BIND_TCP | NET.CONNECT_TCP],
  [10, NET.BIND_UDP | NET.CONNECT_SEND_UDP],
]
export const SCOPES_SINCE: readonly [abi: number, rights: bigint][] = [
  [6, SCOPE.ABSTRACT_UNIX_SOCKET | SCOPE.SIGNAL],
]

export const RLIMIT = { CPU: 0, FSIZE: 1, DATA: 2, CORE: 4, NPROC: 6, NOFILE: 7 } as const
export const PR_SET_NO_NEW_PRIVS = 38
export const O_PATH = 0x200000
export const O_CLOEXEC = 0x80000

export const SECCOMP_SET_MODE_FILTER = 1
export const SECCOMP_FILTER_FLAG_TSYNC = 1
export const SECCOMP_RET_KILL_PROCESS = 0x80000000
export const SECCOMP_RET_ERRNO = 0x00050000
export const SECCOMP_RET_ALLOW = 0x7fff0000
export const EPERM = 1
export const ENOSYS = 38
export const X32_SYSCALL_BIT = 0x40000000
export const AF_INET = 2
export const AF_INET6 = 10
export const SOCK_DGRAM = 2
export const SOCK_TYPE_MASK = 0xf
/** CLONE_NEWNS | NEWCGROUP | NEWUTS | NEWIPC | NEWUSER | NEWPID | NEWNET. */
export const CLONE_NAMESPACE_FLAGS = 0x7e020000

/** `seccomp_data`: nr, arch, instruction pointer, then six little-endian u64 args. */
export const SECCOMP_DATA = { NR: 0, ARCH: 4, ARG0_LOW: 16, ARG1_LOW: 24 } as const
export const BPF = {
  LD_W_ABS: 0x20,
  JEQ_K: 0x15,
  JGE_K: 0x35,
  JSET_K: 0x45,
  AND_K: 0x54,
  RET_K: 0x06,
} as const

/**
 * Syscalls no code reviewer needs and every escape leans on: debugging other processes, mounts
 * and namespaces, kernel modules and keyrings, eBPF, perf, io_uring (it bypasses seccomp).
 */
const DENIED = [
  'ptrace',
  'process_vm_readv',
  'process_vm_writev',
  'mount',
  'umount2',
  'pivot_root',
  'chroot',
  'open_tree',
  'open_tree_attr',
  'move_mount',
  'fsopen',
  'fsconfig',
  'fsmount',
  'fspick',
  'mount_setattr',
  'unshare',
  'setns',
  'init_module',
  'finit_module',
  'delete_module',
  'kexec_load',
  'kexec_file_load',
  'bpf',
  'perf_event_open',
  'keyctl',
  'add_key',
  'request_key',
  'userfaultfd',
  'open_by_handle_at',
  'name_to_handle_at',
  'swapon',
  'swapoff',
  'reboot',
  'io_uring_setup',
  'io_uring_enter',
  'io_uring_register',
] as const
export type DeniedSyscall = (typeof DENIED)[number]
export const DENIED_SYSCALLS: readonly DeniedSyscall[] = DENIED

/** `arch/x86/entry/syscalls/syscall_64.tbl` and `scripts/syscall.tbl` (arm64). */
export const SYSCALLS: Record<'x64' | 'arm64', SyscallTable> = {
  x64: {
    audit: 0xc000003e,
    seccomp: 317,
    prctl: 157,
    clone: 56,
    clone3: 435,
    socket: 41,
    hasX32: true,
    denied: {
      ptrace: 101,
      process_vm_readv: 310,
      process_vm_writev: 311,
      mount: 165,
      umount2: 166,
      pivot_root: 155,
      chroot: 161,
      open_tree: 428,
      open_tree_attr: 467,
      move_mount: 429,
      fsopen: 430,
      fsconfig: 431,
      fsmount: 432,
      fspick: 433,
      mount_setattr: 442,
      unshare: 272,
      setns: 308,
      init_module: 175,
      finit_module: 313,
      delete_module: 176,
      kexec_load: 246,
      kexec_file_load: 320,
      bpf: 321,
      perf_event_open: 298,
      keyctl: 250,
      add_key: 248,
      request_key: 249,
      userfaultfd: 323,
      open_by_handle_at: 304,
      name_to_handle_at: 303,
      swapon: 167,
      swapoff: 168,
      reboot: 169,
      io_uring_setup: 425,
      io_uring_enter: 426,
      io_uring_register: 427,
    },
  },
  arm64: {
    audit: 0xc00000b7,
    seccomp: 277,
    prctl: 167,
    clone: 220,
    clone3: 435,
    socket: 198,
    hasX32: false,
    denied: {
      ptrace: 117,
      process_vm_readv: 270,
      process_vm_writev: 271,
      mount: 40,
      umount2: 39,
      pivot_root: 41,
      chroot: 51,
      open_tree: 428,
      open_tree_attr: 467,
      move_mount: 429,
      fsopen: 430,
      fsconfig: 431,
      fsmount: 432,
      fspick: 433,
      mount_setattr: 442,
      unshare: 97,
      setns: 268,
      init_module: 105,
      finit_module: 273,
      delete_module: 106,
      kexec_load: 104,
      kexec_file_load: 294,
      bpf: 280,
      perf_event_open: 241,
      keyctl: 219,
      add_key: 217,
      request_key: 218,
      userfaultfd: 282,
      open_by_handle_at: 265,
      name_to_handle_at: 264,
      swapon: 224,
      swapoff: 225,
      reboot: 142,
      io_uring_setup: 425,
      io_uring_enter: 426,
      io_uring_register: 427,
    },
  },
}

export const LIBC_CANDIDATES = [
  'libc.so.6',
  'libc.musl-x86_64.so.1',
  'libc.musl-aarch64.so.1',
  '/lib/ld-musl-x86_64.so.1',
  '/lib/ld-musl-aarch64.so.1',
] as const

export const JAIL_ENTRY_BUNDLED = 'jail/jail.js'
export const PROBE_FLAG = '--probe'
export const PROBE_TIMEOUT_MS = 10_000
export const JAIL_EXIT_SETUP_FAILED = 126
