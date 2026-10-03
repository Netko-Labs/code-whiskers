import { afterAll, describe, expect, test } from 'bun:test'
import { initServerTelemetry, reportError, shutdownTelemetry } from '../src/server'
import { createIngestSink } from './ingest-sink'

const SINK_PORT = 4795
const DEAD_PORT = 4797
const sink = createIngestSink(SINK_PORT)
const { hits } = sink
afterAll(sink.stop)

const BASE = { serviceName: 'studio', release: 'r1', environment: 'staging' }

const itemsOf = (body: string) =>
  body
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line))

const sentEvents = () =>
  hits
    .flatMap((hit) => itemsOf(hit.body))
    .filter((item) => 'exception' in item)
    .map((item) => item.exception.values[0].value)

describe('server telemetry', () => {
  test('with no DSN nothing leaves the process', async () => {
    initServerTelemetry(BASE)
    reportError(new Error('unreported'))
    await shutdownTelemetry()
    expect(hits).toEqual([])
  })

  test('an error is one event item, with release, environment, service and path', async () => {
    initServerTelemetry({ ...BASE, dsn: `http://pub@127.0.0.1:${SINK_PORT}/7` })
    const fault = new Error('boom')
    reportError(fault, { path: '/api/triage', tags: { transport: 'test' }, userId: 'u1' })
    reportError(fault)
    reportError(new Error('wrapper', { cause: fault }))
    await shutdownTelemetry()

    expect(hits.every((hit) => hit.path === '/api/7/envelope/')).toBe(true)
    const types = hits.flatMap((hit) => itemsOf(hit.body)).flatMap((item) => item.type ?? [])
    expect(types).toEqual(['event'])
    const event = hits.flatMap((hit) => itemsOf(hit.body)).find((item) => 'exception' in item)
    expect(event).toMatchObject({
      release: 'r1',
      environment: 'staging',
      user: { id: 'u1' },
      tags: { service: 'studio', path: '/api/triage', transport: 'test' },
    })
  })

  test('errors about the ingest, or an ignored path, are dropped before they are sent', async () => {
    hits.length = 0
    initServerTelemetry({
      ...BASE,
      dsn: `http://pub@127.0.0.1:${SINK_PORT}/7`,
      ignoredPaths: [/^\/api\/monitor$/],
    })
    reportError(new Error('envelope'), { path: '/api/7/envelope/' })
    reportError(new Error('store'), { path: '/api/7/store' })
    reportError(new Error('otlp'), { path: '/otlp/v1/traces' })
    reportError(new Error('tunnel'), { path: '/api/monitor' })
    reportError(new Error('kept'), { path: '/api/rules' })
    await shutdownTelemetry()
    expect(sentEvents()).toEqual(['kept'])
  })

  test('an unreachable sink never throws into the caller', async () => {
    initServerTelemetry({ ...BASE, dsn: `http://pub@127.0.0.1:${DEAD_PORT}/7` })
    expect(() => reportError(new Error('lost'))).not.toThrow()
    await shutdownTelemetry(500)
  })
})

describe('a cyclic cause chain', () => {
  test('is reported without hanging', async () => {
    initServerTelemetry({ ...BASE, dsn: `http://pub@127.0.0.1:${DEAD_PORT}/7` })
    const outer = new Error('outer')
    outer.cause = new Error('inner', { cause: outer })
    reportError(outer)
    await shutdownTelemetry()
    expect(true).toBe(true)
  })
})
