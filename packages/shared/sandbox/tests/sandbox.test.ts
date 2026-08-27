import { describe, expect, test } from 'bun:test'
import { createSandbox, dockerAvailable, reapAll } from '../src'

const hasDocker = await dockerAvailable()

describe.if(hasDocker)('sandbox lifecycle', () => {
  test('create -> exec -> file io -> destroy', async () => {
    const sandbox = await createSandbox({ ttlMs: 60_000 })
    try {
      const echo = await sandbox.exec('echo meow')
      expect(echo.code).toBe(0)
      expect(echo.stdout.trim()).toBe('meow')

      await sandbox.writeFile('nested/dir/note.txt', 'whiskers')
      expect((await sandbox.readFile('nested/dir/note.txt')).trim()).toBe('whiskers')

      const offline = await sandbox.exec('wget -q -T 2 http://example.com -O - || echo BLOCKED')
      expect(offline.stdout).toContain('BLOCKED')
    } finally {
      await sandbox.destroy()
    }
  }, 120_000)

  test('reapAll clears strays', async () => {
    await createSandbox({ ttlMs: 60_000 })
    expect(await reapAll()).toBeGreaterThanOrEqual(1)
    expect(await reapAll()).toBe(0)
  }, 120_000)
})

describe.if(!hasDocker)('sandbox (docker unavailable)', () => {
  test('dockerAvailable reports false without throwing', async () => {
    expect(await dockerAvailable()).toBe(false)
  })
})
