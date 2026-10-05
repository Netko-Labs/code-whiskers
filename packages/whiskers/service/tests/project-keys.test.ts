import { describe, expect, mock, test } from 'bun:test'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { ProjectKey } from '@code-whiskers/whiskers-domain'

// Dev self-provisions unknown projects; the refusal under test is production's.
whiskersEnvConfig.app.dev = false

const PROJECT = {
  id: '7',
  name: 'web',
  repository: null,
  legacyPublicKey: null,
  createdAt: new Date(),
}

const keyOf = (id: string, publicKey: string, isEnabled: boolean): ProjectKey => ({
  id,
  projectId: PROJECT.id,
  publicKey,
  label: id,
  isEnabled,
  createdAt: new Date(),
  lastUsedAt: null,
})

const KEYS = [keyOf('a', 'a'.repeat(32), true), keyOf('b', 'b'.repeat(32), true)]
const DISABLED = keyOf('c', 'c'.repeat(32), false)
const touched: string[] = []

// Bun keeps a module mock for the rest of the process: spread the real module.
const realGetProject = await import('../src/queries/tracker/get-project')
mock.module('../src/queries/tracker/get-project', () => ({
  ...realGetProject,
  getProject: async (id: string) => (id === PROJECT.id ? PROJECT : undefined),
}))
const realGetProjects = await import('../src/queries/tracker/get-projects')
mock.module('../src/queries/tracker/get-projects', () => ({
  ...realGetProjects,
  getProjectKeys: async (projectId: string) =>
    projectId === PROJECT.id ? [...KEYS, DISABLED] : [],
}))
const realKeyUsage = await import('../src/tracker/key-usage')
mock.module('../src/tracker/key-usage', () => ({
  ...realKeyUsage,
  touchKey: (keyId: string) => touched.push(keyId),
}))

const { enabledKeyMatching, keyDeletionOf, resolveProject } = await import('../src/tracker')
const { enabledKeyLookup } = await import('../src/telemetry')

describe('enabledKeyMatching', () => {
  test('any enabled key of the project authenticates', () => {
    expect(enabledKeyMatching(KEYS, 'a'.repeat(32))?.id).toBe('a')
    expect(enabledKeyMatching(KEYS, 'b'.repeat(32))?.id).toBe('b')
  })

  test('a disabled, unknown or missing key does not', () => {
    expect(enabledKeyMatching([DISABLED], 'c'.repeat(32))).toBeUndefined()
    expect(enabledKeyMatching(KEYS, 'd'.repeat(32))).toBeUndefined()
    expect(enabledKeyMatching(KEYS, 'a')).toBeUndefined()
    expect(enabledKeyMatching(KEYS, undefined)).toBeUndefined()
  })

  test('a non-ASCII key of the same string length is refused, not thrown on', () => {
    expect(enabledKeyMatching(KEYS, `${'a'.repeat(31)}é`)).toBeUndefined()
  })
})

describe('keyDeletionOf', () => {
  test('a key can go while another enabled key stays', () => {
    expect(keyDeletionOf(KEYS, 'a')).toBe('allowed')
  })

  test('the last enabled key cannot go', () => {
    expect(keyDeletionOf([KEYS[0] as ProjectKey, DISABLED], 'a')).toBe('last-enabled')
  })

  test('a disabled key can always go, and an unknown one is missing', () => {
    expect(keyDeletionOf([KEYS[0] as ProjectKey, DISABLED], 'c')).toBe('allowed')
    expect(keyDeletionOf(KEYS, 'zz')).toBe('missing')
  })
})

describe('resolveProject — DSN auth at ingest', () => {
  test('either enabled key reaches the project and is marked used', async () => {
    expect((await resolveProject('7', 'a'.repeat(32)))?.id).toBe('7')
    expect((await resolveProject('7', 'b'.repeat(32)))?.id).toBe('7')
    expect(touched).toEqual(['a', 'b'])
  })

  test('a disabled key is refused (the route answers 401)', async () => {
    expect(await resolveProject('7', 'c'.repeat(32))).toBeUndefined()
    expect(touched).not.toContain('c')
  })

  test("another project's id does not take this project's key", async () => {
    expect(await resolveProject('8', 'a'.repeat(32))).toBeUndefined()
  })
})

describe('enabledKeyLookup — OTLP auth', () => {
  test('only an enabled key names a project', () => {
    const { sql, params } = enabledKeyLookup('k'.repeat(32)).toSQL()
    expect(sql).toContain('"project_key"."is_enabled" = $')
    expect(params).toContain(true)
  })
})
