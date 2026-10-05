import { describe, expect, test } from 'bun:test'
import { PLATFORM_IDS } from '../constants'
import { dsnFor, dsnPartsOf } from './dsn'
import { matchesPlatform, platformOf, snippetsFor } from './snippets'

const DSN = dsnFor('https://whiskers.example.com', '42', 'a'.repeat(32))
const SDK_PLATFORMS = PLATFORM_IDS.filter((id) => id !== 'otlp')

describe('dsnFor', () => {
  test("Sentry's shape: key as username, project id as path, the console's host", () => {
    expect(DSN).toBe(`https://${'a'.repeat(32)}@whiskers.example.com/42`)
    expect(dsnPartsOf(DSN)).toEqual({
      origin: 'https://whiskers.example.com',
      publicKey: 'a'.repeat(32),
      projectId: '42',
    })
  })
})

describe('snippetsFor', () => {
  test.each(SDK_PLATFORMS)('%s: the env form comes first, DSN filled in', (id) => {
    const { env } = snippetsFor(id, DSN)
    expect(env.code).toBe(`${platformOf(id).envName}=${DSN}`)
    expect(env.code).toMatch(/SENTRY_DSN=https:\/\//)
  })

  test.each(SDK_PLATFORMS)('%s: init carries the same DSN inline', (id) => {
    expect(snippetsFor(id, DSN).init?.code).toContain(DSN)
  })

  test.each(SDK_PLATFORMS)('%s: has a one-step way to throw a test error', (id) => {
    expect(snippetsFor(id, DSN).verify?.code.length).toBeGreaterThan(0)
  })

  test('JavaScript SDKs initialize from their own package', () => {
    expect(snippetsFor('node', DSN).init?.code).toContain("from '@sentry/node'")
    expect(snippetsFor('bun', DSN).install?.code).toBe('bun add @sentry/bun')
    expect(snippetsFor('nextjs', DSN).env.code.startsWith('NEXT_PUBLIC_SENTRY_DSN=')).toBe(true)
  })

  test('the SDK-free check posts to the store endpoint with the key, not the whole DSN', () => {
    const curl = snippetsFor('sentry', DSN).verify?.code ?? ''
    expect(curl).toContain("'https://whiskers.example.com/api/42/store/'")
    expect(curl).toContain(`sentry_key=${'a'.repeat(32)}`)
  })

  test('OTLP gets exporter variables with the key as a bearer, and no init', () => {
    const { env, init, install } = snippetsFor('otlp', DSN)
    expect(env.code).toContain('OTEL_EXPORTER_OTLP_ENDPOINT=https://whiskers.example.com/otlp')
    expect(env.code).toContain('OTEL_EXPORTER_OTLP_PROTOCOL=http/json')
    expect(env.code).toContain(`Authorization=Bearer ${'a'.repeat(32)}`)
    expect(init).toBeNull()
    expect(install).toBeNull()
  })
})

describe('matchesPlatform', () => {
  test('matches the label or a keyword, any case', () => {
    expect(matchesPlatform(platformOf('python'), 'DJANGO')).toBe(true)
    expect(matchesPlatform(platformOf('go'), 'golang')).toBe(true)
    expect(matchesPlatform(platformOf('go'), 'ruby')).toBe(false)
    expect(matchesPlatform(platformOf('go'), '  ')).toBe(true)
  })
})

describe('server verification snippets', () => {
  test('Node and Bun capture the test error instead of crashing the process', () => {
    for (const id of ['node', 'bun'] as const) {
      const code = snippetsFor(id, DSN).verify?.code ?? ''
      expect(code).toContain('captureException')
      expect(code).not.toContain('throw')
    }
  })
})
