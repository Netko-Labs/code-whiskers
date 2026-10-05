import { getProject } from '../../queries/tracker/get-project'
import { testEventOf } from '../../tracker/test-event'
import { ingestEvent } from './ingest-event'
import type { TestEventResult } from './types'

/**
 * The SDK-free proof a project ingests: a synthetic event through the same path an envelope
 * takes, called in-process so no DSN, transport or reporting guard is involved.
 */
export async function sendTestEvent(projectId: string): Promise<TestEventResult | undefined> {
  if (!(await getProject(projectId))) return undefined
  const stored = await ingestEvent(projectId, testEventOf(new Date()))
  // A fresh event_id is never a retry, so nothing stored means the write itself failed.
  if (!stored) throw new Error('test event was not stored')
  return { issueId: stored.issueId, eventId: stored.id }
}
