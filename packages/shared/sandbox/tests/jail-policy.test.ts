import { describe, expect, test } from 'bun:test'
import {
  allowedTarget,
  connectRight,
  encodeProgram,
  evaluateProgram,
  FS,
  handledRights,
  jailEnv,
  jailIdentity,
  jailPolicy,
  lastVerdict,
  NET,
  ruleAccess,
  rulesetAttrSize,
  SCOPE,
  SYSCALLS,
  seccompArch,
  seccompProgram,
} from '../src'

const ALLOW = 0x7fff0000
const KILL = 0x80000000
const errno = (code: number) => 0x00050000 | code

describe('Landlock rights per ABI', () => {
  test('each ABI handles what it added and nothing newer', () => {
    expect(handledRights(1)).toEqual({ fs: (1n << 13n) - 1n, net: 0n, scoped: 0n })
    expect(handledRights(3).fs & FS.TRUNCATE).toBe(FS.TRUNCATE)
    expect(handledRights(3).fs & FS.IOCTL_DEV).toBe(0n)
    expect(handledRights(4).net).toBe(NET.BIND_TCP | NET.CONNECT_TCP)
    expect(handledRights(6).scoped).toBe(SCOPE.ABSTRACT_UNIX_SOCKET | SCOPE.SIGNAL)
    expect(handledRights(8)).toEqual(handledRights(6))
    expect(handledRights(9).fs & FS.RESOLVE_UNIX).toBe(FS.RESOLVE_UNIX)
    expect(handledRights(10).net).toBe(
      NET.BIND_TCP | NET.CONNECT_TCP | NET.BIND_UDP | NET.CONNECT_SEND_UDP,
    )
  })

  test('the ruleset attr grows with the ABI', () => {
    expect([1, 3, 4, 5, 6, 8].map(rulesetAttrSize)).toEqual([8, 8, 16, 16, 24, 24])
  })

  test('only TCP connect is ever granted on a port', () => {
    expect(connectRight(handledRights(10).net)).toBe(NET.CONNECT_TCP)
    expect(connectRight(handledRights(3).net)).toBe(0n)
  })
})

describe('ruleAccess', () => {
  const fs = handledRights(8).fs

  test('read and exec never write; write never executes or makes devices', () => {
    expect(ruleAccess('read', true, fs)).toBe(FS.READ_FILE | FS.READ_DIR)
    expect(ruleAccess('exec', true, fs)).toBe(FS.READ_FILE | FS.READ_DIR | FS.EXECUTE)
    const write = ruleAccess('write', true, fs)
    expect(write & FS.MAKE_REG).toBe(FS.MAKE_REG)
    expect(write & FS.REMOVE_FILE).toBe(FS.REMOVE_FILE)
    expect(write & (FS.EXECUTE | FS.MAKE_CHAR | FS.MAKE_BLOCK | FS.IOCTL_DEV)).toBe(0n)
  })

  test('a file gets file rights only, and nothing the ABI does not handle', () => {
    expect(ruleAccess('read', false, fs)).toBe(FS.READ_FILE)
    expect(ruleAccess('device', false, fs)).toBe(
      FS.READ_FILE | FS.WRITE_FILE | FS.TRUNCATE | FS.IOCTL_DEV,
    )
    expect(ruleAccess('device', false, handledRights(1).fs)).toBe(FS.READ_FILE | FS.WRITE_FILE)
  })
})

describe('jailPolicy', () => {
  const policy = jailPolicy({
    checkout: '/tmp/whiskers-review-x',
    binary: '/app/dist/claude/claude',
    home: '/tmp/whiskers-jail-y',
    proxyPort: 40_123,
    uid: 65_534,
    limits: { memoryMb: 2_048 },
  })
  const grantFor = (path: string) => policy.grants.filter((grant) => grant.path === path)

  test('checkout read-only, binary dir executable, home the only writable path', () => {
    expect(grantFor('/tmp/whiskers-review-x')).toEqual([
      { path: '/tmp/whiskers-review-x', access: 'read' },
    ])
    expect(grantFor('/app/dist/claude')).toEqual([{ path: '/app/dist/claude', access: 'exec' }])
    expect(policy.grants.filter((grant) => grant.access === 'write')).toEqual([
      { path: '/tmp/whiskers-jail-y', access: 'write' },
    ])
    expect(policy.grants.some((grant) => grant.path === '/' || grant.path === '/tmp')).toBe(false)
    expect(policy.grants.some((grant) => grant.path.startsWith('/proc/1'))).toBe(false)
  })

  test('the proxy port is the only one, limits merge over defaults, the harness starts in the checkout', () => {
    expect(policy.connectPorts).toEqual([40_123])
    expect(policy.limits).toMatchObject({ memoryMb: 2_048, processes: 512, cpuSeconds: 1_200 })
    expect(policy.cwd).toBe('/tmp/whiskers-review-x')
    expect(policy.hasSeccomp).toBe(true)
  })

  test('uid drops only from root; otherwise the jail keeps the worker uid', () => {
    expect(jailIdentity(65_534, 0)).toEqual({ uid: 65_534, gid: 65_534 })
    expect(jailIdentity(65_534, 1_000).uid).toBe(1_000)
  })
})

describe('jailEnv', () => {
  test('own home and temp, every request through the proxy, the base passed as is', () => {
    const env = jailEnv({ PATH: '/usr/bin', TOKEN: 't' }, '/tmp/home', 'http://127.0.0.1:4000')
    expect(env).toEqual({
      PATH: '/usr/bin',
      TOKEN: 't',
      HOME: '/tmp/home',
      TMPDIR: '/tmp/home/tmp',
      HTTPS_PROXY: 'http://127.0.0.1:4000',
      HTTP_PROXY: 'http://127.0.0.1:4000',
      NO_PROXY: '',
    })
  })
})

describe('seccomp filter', () => {
  for (const arch of ['x64', 'arm64'] as const) {
    const table = SYSCALLS[arch]
    const program = seccompProgram(arch)
    const run = (nr: number, args?: [number, number]) =>
      evaluateProgram(program, { arch: table.audit, nr, args })

    test(`${arch}: denied syscalls get EPERM, the rest pass`, () => {
      for (const nr of Object.values(table.denied)) expect(run(nr)).toBe(errno(1))
      expect(run(0)).toBe(ALLOW)
      expect(run(table.seccomp)).toBe(ALLOW)
    })

    test(`${arch}: foreign arch is killed; clone3 is ENOSYS; namespaced clone and UDP are refused`, () => {
      expect(evaluateProgram(program, { arch: 0x40000003, nr: 0 })).toBe(KILL)
      expect(run(table.clone3)).toBe(errno(38))
      expect(run(table.clone, [0x10000000, 0])).toBe(errno(1))
      expect(run(table.clone, [0x003d0f00, 0])).toBe(ALLOW)
      expect(run(table.socket, [2, 2])).toBe(errno(1))
      expect(run(table.socket, [10, 2 | 0x80000])).toBe(errno(1))
      expect(run(table.socket, [2, 1])).toBe(ALLOW)
      expect(run(table.socket, [1, 2])).toBe(ALLOW)
    })
  }

  test('x32 numbers on x64 are killed', () => {
    const program = seccompProgram('x64')
    expect(evaluateProgram(program, { arch: SYSCALLS.x64.audit, nr: 0x40000000 + 1 })).toBe(KILL)
  })

  test('encodes eight bytes per instruction and knows this arch', () => {
    const program = seccompProgram('arm64')
    expect(encodeProgram(program).byteLength).toBe(program.length * 8)
    expect(seccompArch('x64')).toBe('x64')
    expect(seccompArch('ia32')).toBeNull()
  })
})

describe('allowedTarget', () => {
  const allow = new Set(['api.anthropic.com'])

  test('only CONNECT to an allowed host on 443', () => {
    expect(allowedTarget('CONNECT api.anthropic.com:443 HTTP/1.1\r\nHost: x', allow)).toEqual({
      host: 'api.anthropic.com',
      port: 443,
    })
    expect(allowedTarget('CONNECT example.com:443 HTTP/1.1', allow)).toBeNull()
    expect(allowedTarget('CONNECT api.anthropic.com:80 HTTP/1.1', allow)).toBeNull()
    expect(allowedTarget('GET http://api.anthropic.com/ HTTP/1.1', allow)).toBeNull()
    expect(allowedTarget('', allow)).toBeNull()
  })
})

describe('lastVerdict', () => {
  test('the last stage the probe reported wins; noise and a cut-off line are skipped', () => {
    const stage = (reason: string | null, hasSeccomp: boolean) =>
      JSON.stringify({ isUsable: true, landlockAbi: 8, canDropUid: true, hasSeccomp, reason })
    const killed = `${stage('seccomp killed the probe', false)}\n`
    expect(lastVerdict(killed)?.reason).toBe('seccomp killed the probe')
    const full = `${killed}${stage(null, true)}\n{"isUsa`
    expect(lastVerdict(full)).toMatchObject({ hasSeccomp: true, reason: null })
    expect(lastVerdict('jail: boom')).toBeNull()
  })
})
