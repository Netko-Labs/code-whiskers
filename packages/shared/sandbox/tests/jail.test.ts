import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { chmod, chown, copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  type EgressProxy,
  jailPolicy,
  NOBODY_UID,
  probeJail,
  spawnJailed,
  startEgressProxy,
} from '../src'

const probe = await probeJail(NOBODY_UID)
const isRoot = process.getuid?.() === 0

describe.if(probe.isUsable)('jail (Linux, Landlock)', () => {
  let root: string
  let checkout: string
  let outside: string
  let home: string
  let proxy: EgressProxy
  let forbidden: Server
  let forbiddenPort: number

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'whiskers-jail-test-'))
    await chmod(root, 0o755)
    checkout = join(root, 'checkout')
    outside = join(root, 'outside')
    home = join(root, 'home')
    await Promise.all([mkdir(checkout), mkdir(outside, { mode: 0o777 }), mkdir(home)])
    await chmod(outside, 0o777)
    await writeFile(join(checkout, 'inside.txt'), 'meow')
    await writeFile(join(outside, 'secret.txt'), 'DATABASE_URL=postgres://secret', { mode: 0o644 })
    await copyFile(join(import.meta.dir, 'jail-child.ts'), join(checkout, 'child.ts'))
    if (isRoot) await chown(home, NOBODY_UID, NOBODY_UID)
    proxy = await startEgressProxy(['api.anthropic.com'])
    forbidden = createServer((socket) => socket.end())
    await new Promise<void>((resolve) => forbidden.listen(0, '127.0.0.1', resolve))
    const address = forbidden.address()
    forbiddenPort = typeof address === 'object' && address ? address.port : 0
  })

  afterAll(async () => {
    await proxy.close()
    forbidden.close()
    await rm(root, { recursive: true, force: true })
  })

  test('confines files, network and syscalls, and drops root', async () => {
    const policy = jailPolicy({
      checkout,
      binary: process.execPath,
      home,
      proxyPort: proxy.port,
      extraGrants: [{ path: dirname(process.execPath), access: 'exec' }],
    })
    const child = spawnJailed({
      policy,
      argv: [
        process.execPath,
        '--no-install',
        join(checkout, 'child.ts'),
        checkout,
        outside,
        home,
        String(forbiddenPort),
        proxy.url,
      ],
      env: { PATH: '/usr/bin:/bin', HOME: home, TMPDIR: home },
      launcherCwd: home,
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })
    const code = await new Promise<number | null>((resolve) => child.on('exit', resolve))
    expect({ code, stderr: stderr.slice(0, 500) }).toEqual({ code: 0, stderr: '' })
    const report = JSON.parse(stdout)

    expect(report.uid).toBe(isRoot ? NOBODY_UID : process.getuid?.())
    expect(report.readInside).toBe('ok')
    expect(report.readOutside).toBe('EACCES')
    expect(report.readWorkerEnv).not.toBe('ok')
    expect(report.writeCheckout).toBe('EACCES')
    expect(report.writeOutside).toBe('EACCES')
    expect(report.writeHome).toBe('ok')
    expect(report.connectForbidden).toBe('EACCES')
    expect(report.allowedHost).toMatch(/^status (?!403)\d+$/)
    expect(report.otherHost).toMatch(/^(refused|status 403)$/)
    if (probe.hasSeccomp) {
      expect(report.udp).not.toBe('ok')
      expect(report.unshare).toBe('refused')
    }
  }, 60_000)
})

describe.if(!probe.isUsable)('jail (unavailable here)', () => {
  test('the probe says why instead of throwing', () => {
    expect(probe.reason).toBeString()
  })
})
