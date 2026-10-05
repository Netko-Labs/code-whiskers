import {
  type SentryEvent,
  TEST_EVENT_FINGERPRINT,
  TEST_EVENT_TAG,
  TEST_EVENT_TITLE,
} from '@code-whiskers/whiskers-domain'

/**
 * What "Send test event" ingests: a plain message, so its title is exactly the sentence, and one
 * fingerprint, so every test lands on the same issue.
 */
export function testEventOf(now: Date, eventId: string = crypto.randomUUID().replaceAll('-', '')) {
  return {
    event_id: eventId,
    timestamp: now.getTime() / 1000,
    platform: 'other',
    level: 'error',
    message: TEST_EVENT_TITLE,
    release: TEST_EVENT_TAG,
    environment: TEST_EVENT_TAG,
    fingerprint: [TEST_EVENT_FINGERPRINT],
    tags: { 'codewhiskers.test_event': 'true' },
    sdk: { name: 'codewhiskers.test-event', version: '1' },
  } satisfies SentryEvent
}
