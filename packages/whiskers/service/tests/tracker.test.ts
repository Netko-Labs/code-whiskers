import { describe, expect, test } from 'bun:test'
import { brotliCompressSync, deflateRawSync, deflateSync, gzipSync } from 'node:zlib'
import {
  fingerprintOf,
  levelOf,
  MAX_COMPRESSED_BODY_BYTES,
  MAX_DECOMPRESSED_BODY_BYTES,
  messageOf,
  parseEnvelope,
  parseStoreEvent,
  readIngestBody,
} from '../src/tracker'

const envelope = (items: Array<[Record<string, unknown>, Record<string, unknown>]>) =>
  [
    JSON.stringify({ event_id: 'abc', sent_at: '2026-08-27T00:00:00Z' }),
    ...items.flatMap(([header, payload]) => [JSON.stringify(header), JSON.stringify(payload)]),
  ].join('\n')

const bytesOf = (...parts: Array<string | Uint8Array>) =>
  Buffer.concat(parts.map((part) => (typeof part === 'string' ? Buffer.from(part) : part)))

const post = (body: Uint8Array, encoding?: string) =>
  new Request('http://whiskers.test/api/1/envelope', {
    method: 'POST',
    headers: encoding ? { 'content-encoding': encoding } : {},
    body,
  })

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

  test('slices binary items by their declared length', () => {
    const attachment = new Uint8Array([0x0a, 0xff, 0x00, 0x7b, 0x0a, 0x0a, 0xfe])
    const event = JSON.stringify({ event_id: 'e3', message: 'after the attachment' })
    const raw = bytesOf(
      '{"event_id":"e3"}\n',
      `{"type":"attachment","length":${attachment.byteLength},"filename":"blob.bin"}\n`,
      attachment,
      '\n',
      `{"type":"event","length":${Buffer.byteLength(event)}}\n`,
      event,
    )
    const events = parseEnvelope(raw)
    expect(events.map((e) => e.event_id)).toEqual(['e3'])
  })

  test('a length-delimited payload need not end in a newline', () => {
    const event = JSON.stringify({ event_id: 'e4' })
    const session = '{"sid":"x"}'
    const raw = bytesOf(
      '{}\n',
      `{"type":"session","length":${session.length}}\n`,
      session,
      `{"type":"event","length":${event.length}}\n`,
      event,
    )
    expect(parseEnvelope(raw).map((e) => e.event_id)).toEqual(['e4'])
  })
})

describe('parseStoreEvent', () => {
  test('invalid JSON is a malformed event, not a throw', () => {
    expect(parseStoreEvent(bytesOf('{not json'))).toBeUndefined()
    expect(parseStoreEvent(bytesOf('{"event_id":"s1"}'))?.event_id).toBe('s1')
  })
})

describe('readIngestBody', () => {
  const json = bytesOf('{"event_id":"z1"}')

  test.each([
    ['gzip', gzipSync(json)],
    [' GZip ', gzipSync(json)],
    ['deflate', deflateSync(json)],
    ['deflate', deflateRawSync(json)],
    ['br', brotliCompressSync(json)],
    ['gzip, br', brotliCompressSync(gzipSync(json))],
    ['identity', json],
  ])('decodes %p', async (encoding, body) => {
    const read = await readIngestBody(post(body, encoding))
    expect(read.ok && Buffer.from(read.bytes).toString()).toBe('{"event_id":"z1"}')
  })

  test('unknown encodings are refused', async () => {
    expect(await readIngestBody(post(json, 'zstd'))).toMatchObject({ ok: false, status: 415 })
  })

  test('corrupt compressed bodies are a 400', async () => {
    expect(await readIngestBody(post(json, 'gzip'))).toMatchObject({ ok: false, status: 400 })
  })

  test('bodies over the wire limit are a 413', async () => {
    const huge = new Uint8Array(MAX_COMPRESSED_BODY_BYTES + 1)
    expect(await readIngestBody(post(huge))).toMatchObject({ ok: false, status: 413 })
  })

  test('decompression bombs stop at the decoded limit', async () => {
    const bomb = gzipSync(new Uint8Array(MAX_DECOMPRESSED_BODY_BYTES + 1))
    expect(bomb.byteLength).toBeLessThan(MAX_COMPRESSED_BODY_BYTES)
    expect(await readIngestBody(post(bomb, 'gzip'))).toMatchObject({ ok: false, status: 413 })
  })
})

describe('grouping', () => {
  const exceptionEvent = {
    exception: { values: [{ type: 'TypeError', value: 'x is not a function' }] },
  }

  const thrownAt = (frame: Record<string, unknown>) => ({
    exception: {
      values: [
        {
          type: 'Error',
          value: 'request failed',
          stacktrace: {
            frames: [
              { in_app: true, ...frame },
              { filename: '/app/node_modules/pg/client.js', function: 'query', in_app: true },
            ],
          },
        },
      ],
    },
  })

  test('exception identity drives fingerprint and title', () => {
    expect(fingerprintOf(exceptionEvent)).toBe('TypeError|x is not a function')
    expect(messageOf(exceptionEvent)).toBe('TypeError: x is not a function')
    expect(levelOf(exceptionEvent)).toBe('error')
  })

  test('chained exceptions group and title by the thrown error, not its cause', () => {
    const chained = {
      exception: {
        values: [
          { type: 'ECONNREFUSED', value: 'connect failed' },
          { type: 'SyncError', value: 'sync aborted' },
        ],
      },
    }
    expect(messageOf(chained)).toBe('SyncError: sync aborted')
    expect(fingerprintOf(chained)).toBe('SyncError|sync aborted')
  })

  test('the top in-app frame splits same-message errors from different code', () => {
    const users = thrownAt({ filename: '/app/src/users.ts', function: 'loadUser' })
    const orders = thrownAt({ filename: '/app/src/orders.ts', function: 'loadOrder' })
    expect(fingerprintOf(users)).toBe('Error|request failed|/app/src/users.ts:loadUser')
    expect(fingerprintOf(users)).not.toBe(fingerprintOf(orders))
  })

  test('a root-relative module beats an absolute filename', () => {
    const event = thrownAt({ filename: '/srv/r7/users.ts', module: 'users', function: 'load' })
    expect(fingerprintOf(event)).toBe('Error|request failed|users:load')
  })

  test('line moves within a function keep the group', () => {
    const at = (lineno: number) => thrownAt({ filename: '/app/src/a.ts', function: 'run', lineno })
    expect(fingerprintOf(at(10))).toBe(fingerprintOf(at(42)))
  })

  test('frames outside the app never enter the fingerprint', () => {
    const vendored = thrownAt({ filename: '/app/src/a.ts', function: 'run', in_app: false })
    expect(fingerprintOf(vendored)).toBe('Error|request failed')
  })

  test('a malformed stacktrace falls back to exception identity', () => {
    const odd = { exception: { values: [{ type: 'E', value: 'v', stacktrace: { frames: 'x' } }] } }
    expect(fingerprintOf(odd)).toBe('E|v')
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
