import { describe, expect, test } from 'bun:test'
import { normalizeEvent } from '../src/queries/tracker'

describe('normalizeEvent', () => {
  test('frames come out throwing-frame first, library frames marked', () => {
    const detail = normalizeEvent({
      level: 'error',
      exception: {
        values: [
          {
            type: 'TypeError',
            value: 'x is undefined',
            stacktrace: {
              frames: [
                { filename: 'node_modules/express/router.js', function: 'handle', lineno: 10 },
                {
                  filename: 'src/auth/session.ts',
                  function: 'readSession',
                  lineno: 118,
                  in_app: true,
                },
              ],
            },
          },
        ],
      },
      contexts: { trace: { trace_id: 'abc' } },
      tags: [['browser', 'Chrome']],
      request: { method: 'POST', url: 'https://app/api/pay' },
    })
    expect(detail.message).toBe('TypeError: x is undefined')
    expect(detail.frames.map((f) => f.function)).toEqual(['readSession', 'handle'])
    expect(detail.frames[1]?.isInApp).toBe(false)
    expect(detail.traceId).toBe('abc')
    expect(detail.tags).toEqual({ browser: 'Chrome' })
    expect(detail.request).toEqual({ method: 'POST', url: 'https://app/api/pay' })
  })

  test('a message-only event still reads', () => {
    const detail = normalizeEvent({
      message: 'Retry budget exhausted',
      breadcrumbs: { values: [{ category: 'http', message: 'GET /x' }] },
    })
    expect(detail.message).toBe('Retry budget exhausted')
    expect(detail.frames).toEqual([])
    expect(detail.breadcrumbs).toEqual([
      { timestamp: null, category: 'http', level: 'info', message: 'GET /x' },
    ])
  })
})
