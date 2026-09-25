import type { ConsoleOrg, TriageBucket } from '../../console-model'

export const TRIAGE_TITLES: Record<TriageBucket, { title: string; sub: string }> = {
  inbox: { title: 'Needs review', sub: 'newest first' },
  assigned: { title: 'Assigned to me', sub: 'you own these' },
  snoozed: { title: 'Snoozed', sub: 'back in the inbox when the snooze ends' },
}

export const ORGS: ConsoleOrg[] = [
  {
    login: 'sample-org',
    isOrganization: true,
    name: 'Sample organization',
    meta: 'appears until the GitHub sync runs',
    mono: 'SO',
    tint: '#e4e4e7',
  },
]

export const SAMPLE_DATA_NOTE = 'Sample data — no events ingested yet'
