import { describe, expect, test } from 'bun:test'
import type { WhiskersLog } from '@/integrations/whiskers'
import { attributeEntries } from '../../../shared/telemetry-attributes'
import { nextAck, tailView } from './utils'

const line = (id: number): WhiskersLog => ({
  id,
  projectId: 'p',
  service: 'api',
  level: 'INFO',
  message: `line ${id}`,
  attributes: {},
  traceId: null,
  spanId: null,
  timestamp: new Date(id),
})

describe('live tail', () => {
  test('the first ack is the newest line and nothing is fresh yet', () => {
    expect(nextAck([line(9), line(8)], null)).toEqual({ id: 9, freshAfter: 9 })
  })

  test('newer lines wait behind the ack until it moves', () => {
    const ack = { id: 8, freshAfter: 8 }
    const lines = [line(10), line(9), line(8), line(7)]
    expect(tailView(lines, ack)).toEqual({ visible: [line(8), line(7)], pending: 2 })
    expect(nextAck(lines, ack)).toEqual({ id: 10, freshAfter: 8 })
  })

  test('without an ack every line shows; an older page keeps the ack', () => {
    expect(tailView([line(2)], null)).toEqual({ visible: [line(2)], pending: 0 })
    const ack = { id: 5, freshAfter: 3 }
    expect(nextAck([line(4)], ack)).toBe(ack)
  })
})

describe('attributeEntries', () => {
  test('sorted, with structured values as JSON', () => {
    expect(attributeEntries({ b: 1, a: 'x', c: { d: true } })).toEqual([
      ['a', 'x'],
      ['b', '1'],
      ['c', '{"d":true}'],
    ])
  })
})
