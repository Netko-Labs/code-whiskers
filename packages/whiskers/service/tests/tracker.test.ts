import { describe, expect, test } from 'bun:test'
import { fingerprintOf, levelOf, messageOf, parseEnvelope } from '../src/tracker'

const envelope = (items: Array<[Record<string, unknown>, Record<string, unknown>]>) =>
  [
    JSON.stringify({ event_id: 'abc', sent_at: '2026-08-27T00:00:00Z' }),
    ...items.flatMap(([header, payload]) => [JSON.stringify(header), JSON.stringify(payload)]),
  ].join('\n')

describe('parseEnvelope', () => {
  test('extracts event items and skips the rest', () => {
    const raw = envelope([
      [{ type: 'session' }, { sid: 'x' }],
      [{ type: 'event' }, { event_id: 'e1', level: 'error', message: 'boom' }],
    ])
    const events = parseEnvelope(raw)
    expect(events).toHaveLength(1)
    expect(events[0]?.event_id).toBe('e1')
  })

  test('resyncs past malformed lines', () => {
    expect(parseEnvelope('{}\nnot-json\n{"type":"event"}\n{"event_id":"e2"}')).toHaveLength(1)
    expect(parseEnvelope('')).toHaveLength(0)
  })
})

describe('grouping', () => {
  const exceptionEvent = {
    exception: { values: [{ type: 'TypeError', value: 'x is not a function' }] },
  }

  test('exception identity drives fingerprint and title', () => {
    expect(fingerprintOf(exceptionEvent)).toBe('TypeError|x is not a function')
    expect(messageOf(exceptionEvent)).toBe('TypeError: x is not a function')
    expect(levelOf(exceptionEvent)).toBe('error')
  })

  test('explicit fingerprint wins', () => {
    expect(fingerprintOf({ ...exceptionEvent, fingerprint: ['custom'] })).toBe('custom')
  })

  test('message events group by message', () => {
    expect(fingerprintOf({ message: 'plain warning' })).toBe('msg|plain warning')
    expect(levelOf({ message: 'plain warning' })).toBe('info')
  })

  test('same error type, same fingerprint across events', () => {
    const other = { exception: { values: [{ type: 'TypeError', value: 'x is not a function' }] } }
    expect(fingerprintOf(exceptionEvent)).toBe(fingerprintOf(other))
  })
})
