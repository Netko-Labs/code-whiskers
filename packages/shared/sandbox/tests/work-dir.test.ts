import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test'
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { mkdtempShared, stageForDaemon } from '../src'

let root: string
let binary: string

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'whiskers-workdir-test-'))
  binary = join(root, 'claude')
  await writeFile(binary, 'meow')
})

afterEach(() => {
  delete process.env.SANDBOX_WORK_DIR
})

afterAll(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('without SANDBOX_WORK_DIR', () => {
  test('temp dirs land in tmpdir and binaries mount in place', async () => {
    const dir = await mkdtempShared('whiskers-x-')
    expect(dirname(dir)).toBe(tmpdir().replace(/\/$/, ''))
    await rm(dir, { recursive: true })
    expect(await stageForDaemon(binary)).toBe(binary)
  })
})

describe('with SANDBOX_WORK_DIR', () => {
  test('temp dirs land on the shared dir, created on first use', async () => {
    process.env.SANDBOX_WORK_DIR = join(root, 'shared')
    const dir = await mkdtempShared('whiskers-x-')
    expect(dirname(dir)).toBe(join(root, 'shared'))
  })

  test('a binary is copied onto the shared dir once, executable', async () => {
    process.env.SANDBOX_WORK_DIR = join(root, 'shared')
    const staged = await stageForDaemon(binary)
    expect(staged).toBe(join(root, 'shared', 'bin', 'claude'))
    expect(await Bun.file(staged).text()).toBe('meow')
    const first = await stat(staged)
    expect(first.mode & 0o777).toBe(0o755)
    await stageForDaemon(binary)
    expect((await stat(staged)).mtimeMs).toBe(first.mtimeMs)
  })

  test('a changed binary is copied again; one already on the shared dir is not', async () => {
    process.env.SANDBOX_WORK_DIR = join(root, 'shared')
    await writeFile(binary, 'meow meow')
    const staged = await stageForDaemon(binary)
    expect(await Bun.file(staged).text()).toBe('meow meow')
    expect(await stageForDaemon(staged)).toBe(staged)
  })
})
