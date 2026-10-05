import type { IssueListParams } from '@/integrations/whiskers'
import type { TriageBucket } from '../../console-model'

export const TRIAGE_TITLES: Record<TriageBucket, { title: string; sub: string }> = {
  inbox: { title: 'Needs review', sub: 'newest first' },
  assigned: { title: 'Assigned to me', sub: 'you own these' },
  snoozed: { title: 'Snoozed', sub: 'back in the inbox when the snooze ends' },
}

/** The inbox's slice of issues: what still needs a human, newest activity first. */
export const INBOX_ISSUE_QUERY: IssueListParams = {
  status: 'unresolved',
  sort: 'last_seen',
  limit: 100,
}
export const DRAFT_HINT = 'Visible to your team · ⌘↵ to post'
