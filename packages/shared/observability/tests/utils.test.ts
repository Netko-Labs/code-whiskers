import { describe, expect, test } from 'bun:test'
import { dsnOf, environmentOf, isIgnoredPath, isServerFault, isValidDsn, releaseOf } from '../src'

describe('release and environment', () => {
  test('release prefers SENTRY_RELEASE, then the Coolify commit, then dev', () => {
    expect(releaseOf({ SENTRY_RELEASE: 'v1', SOURCE_COMMIT: 'abc' })).toBe('v1')
    expect(releaseOf({ SOURCE_COMMIT: 'abc' })).toBe('abc')
    expect(releaseOf({ SENTRY_RELEASE: '' })).toBe('dev')
  })

  test('environment is explicit, else derived from NODE_ENV', () => {
    expect(environmentOf({ SENTRY_ENVIRONMENT: 'staging', NODE_ENV: 'production' })).toBe('staging')
    expect(environmentOf({ NODE_ENV: 'production' })).toBe('production')
    expect(environmentOf({ NODE_ENV: 'test' })).toBe('development')
  })
})

describe('DSN', () => {
  test('accepts the Sentry shape and rejects the rest', () => {
    expect(isValidDsn('https://pub@whiskers.example.com/42')).toBe(true)
    expect(isValidDsn('http://pub@127.0.0.1:4795/7')).toBe(true)
    expect(isValidDsn('https://whiskers.example.com/42')).toBe(false)
    expect(isValidDsn('https://pub@whiskers.example.com/42/')).toBe(false)
    expect(isValidDsn('https://pub@whiskers.example.com/my-project')).toBe(false)
    expect(isValidDsn('ftp://pub@whiskers.example.com/42')).toBe(false)
    expect(isValidDsn('pub@whiskers')).toBe(false)
  })

  test('a placeholder or malformed DSN reads as unset', () => {
    expect(dsnOf('XXXXXXXXXXXXXXXX')).toBeUndefined()
    expect(dsnOf('')).toBeUndefined()
    expect(dsnOf(undefined)).toBeUndefined()
    expect(dsnOf('https://pub@whiskers.example.com/42')).toBe('https://pub@whiskers.example.com/42')
  })
})

describe('what gets reported', () => {
  test('the ingest paths are always ignored, extra patterns on top', () => {
    expect(isIgnoredPath('/api/7/envelope/')).toBe(true)
    expect(isIgnoredPath('/api/7/store')).toBe(true)
    expect(isIgnoredPath('/api/7/deploys')).toBe(true)
    expect(isIgnoredPath('/otlp/v1/logs')).toBe(true)
    expect(isIgnoredPath('/v1/projects/7/test-event')).toBe(true)
    expect(isIgnoredPath('/v1/projects/7')).toBe(false)
    expect(isIgnoredPath('/api/triage')).toBe(false)
    expect(isIgnoredPath('/webhooks/github', [/^\/webhooks\//])).toBe(true)
  })

  test('deliberate HTTP errors below 500 are not faults', () => {
    expect(isServerFault(new Error('boom'))).toBe(true)
    expect(isServerFault(Object.assign(new Error('nope'), { status: 404 }))).toBe(false)
    expect(isServerFault(Object.assign(new Error('down'), { status: 503 }))).toBe(true)
    expect(isServerFault('text')).toBe(true)
  })
})
