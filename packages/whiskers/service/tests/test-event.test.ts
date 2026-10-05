import { describe, expect, mock, test } from 'bun:test'
import {
  type SentryEvent,
  SentryEventSchema,
  TEST_EVENT_TAG,
  TEST_EVENT_TITLE,
} from '@code-whiskers/whiskers-domain'

const ISSUE_ID = '6762076c-880a-40ba-ac33-2830f16207d5'
const ingested: Array<{ projectId: string; event: SentryEvent }> = []

const realIngest = await import('../src/mutations/tracker/ingest-event')
mock.module('../src/mutations/tracker/ingest-event', () => ({
  ...realIngest,
  ingestEvent: async (projectId: string, event: SentryEvent) => {
    ingested.push({ projectId, event })
    return { id: `row-${ingested.length}`, issueId: ISSUE_ID }
  },
}))
const realGetProject = await import('../src/queries/tracker/get-project')
mock.module('../src/queries/tracker/get-project', () => ({
  ...realGetProject,
  getProject: async (id: string) => (id === '7' ? { id } : undefined),
}))

const { sendTestEvent } = await import('../src/mutations/tracker')
const { fingerprintOf, levelOf, messageOf, testEventOf } = await import('../src/tracker')

describe('testEventOf', () => {
  const event = testEventOf(new Date('2026-10-04T12:00:00Z'), 'f'.repeat(32))

  test('parses as an SDK event would', () => {
    expect(SentryEventSchema.safeParse(event).success).toBe(true)
  })

  test('groups into one error issue titled with the sentence, tagged test', () => {
    expect(messageOf(event)).toBe(TEST_EVENT_TITLE)
    expect(levelOf(event)).toBe('error')
    expect(fingerprintOf(event)).toBe(fingerprintOf(testEventOf(new Date())))
    expect(event.release).toBe(TEST_EVENT_TAG)
    expect(event.environment).toBe(TEST_EVENT_TAG)
  })

  test('every send is a new event, never an SDK retry', () => {
    expect(testEventOf(new Date()).event_id).not.toBe(testEventOf(new Date()).event_id)
  })
})

describe('sendTestEvent', () => {
  test('goes through ingestEvent for the project and answers with the issue', async () => {
    const result = await sendTestEvent('7')
    expect(result).toEqual({ issueId: ISSUE_ID, eventId: 'row-1' })
    expect(ingested).toHaveLength(1)
    expect(ingested[0]?.projectId).toBe('7')
    expect(messageOf(ingested[0]?.event as SentryEvent)).toBe(TEST_EVENT_TITLE)
  })

  test('an unknown project ingests nothing', async () => {
    expect(await sendTestEvent('8')).toBeUndefined()
    expect(ingested).toHaveLength(1)
  })
})
