import { describe, expect, test } from 'bun:test'
import { fromNanos, logLevelOf, parseLogs, parseTraces, statusOf } from '../src/telemetry'

const resource = { attributes: [{ key: 'service.name', value: { stringValue: 'checkout' } }] }

describe('parseLogs', () => {
  test('one row per record, with the resource service and the record attributes', () => {
    const rows = parseLogs({
      resourceLogs: [
        {
          resource,
          scopeLogs: [
            {
              logRecords: [
                {
                  timeUnixNano: '1790000000123000000',
                  severityNumber: 17,
                  body: { stringValue: 'payment declined' },
                  attributes: [{ key: 'order.id', value: { intValue: '42' } }],
                  traceId: 'abc',
                },
              ],
            },
          ],
        },
      ],
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      service: 'checkout',
      level: 'ERROR',
      message: 'payment declined',
      attributes: { 'order.id': 42 },
      traceId: 'abc',
    })
    expect(rows[0]?.timestamp.getTime()).toBe(1_790_000_000_123)
  })

  test('a structured body is kept as JSON rather than dropped', () => {
    const rows = parseLogs({
      resourceLogs: [
        {
          scopeLogs: [
            {
              logRecords: [
                { body: { kvlistValue: { values: [{ key: 'a', value: { boolValue: true } }] } } },
              ],
            },
          ],
        },
      ],
    })
    expect(rows[0]?.message).toBe('{"a":true}')
    expect(rows[0]?.service).toBe('unknown')
  })
})

describe('parseTraces', () => {
  test('duration comes from start and end; spans without ids are skipped', () => {
    const rows = parseTraces({
      resourceSpans: [
        {
          resource,
          scopeSpans: [
            {
              spans: [
                {
                  traceId: 't1',
                  spanId: 's1',
                  name: 'POST /pay',
                  startTimeUnixNano: '1790000000000000000',
                  endTimeUnixNano: '1790000000250000000',
                  status: { code: 'STATUS_CODE_ERROR' },
                },
                { name: 'no ids' },
              ],
            },
          ],
        },
      ],
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      name: 'POST /pay',
      durationMs: 250,
      status: 'error',
      service: 'checkout',
    })
  })
})

describe('small parsers', () => {
  test('severity numbers map to levels, text is the fallback', () => {
    expect(logLevelOf(9, undefined)).toBe('INFO')
    expect(logLevelOf(13, undefined)).toBe('WARN')
    expect(logLevelOf(undefined, 'warning')).toBe('WARN')
    expect(logLevelOf(undefined, undefined)).toBe('INFO')
  })

  test('status accepts numbers and enum names', () => {
    expect(statusOf(2)).toBe('error')
    expect(statusOf('STATUS_CODE_OK')).toBe('ok')
    expect(statusOf(undefined)).toBe('unset')
  })

  test('a missing or zero timestamp falls back', () => {
    const fallback = new Date(5)
    expect(fromNanos('0', fallback)).toBe(fallback)
    expect(fromNanos(undefined, fallback)).toBe(fallback)
  })
})
