import { describe, expect, test } from 'bun:test'
import { isTransient } from './retry'

describe('isTransient', () => {
  test('network failures, timeouts, rate limits and 5xx are worth another attempt', () => {
    expect(isTransient(new Error('fetch failed'))).toBe(true)
    expect(isTransient({ status: 502 })).toBe(true)
    expect(isTransient({ statusCode: 429 })).toBe(true)
    expect(isTransient({ status: 408 })).toBe(true)
  })

  test('a 4xx fails the same way again', () => {
    expect(isTransient({ status: 404 })).toBe(false)
    expect(isTransient({ status: 422 })).toBe(false)
    expect(isTransient({ statusCode: 401 })).toBe(false)
  })
})
