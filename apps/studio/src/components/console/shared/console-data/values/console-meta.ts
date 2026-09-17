import type {
  ConsoleComment,
  ConsoleNotification,
  ConsoleOrg,
  ConsoleTeammate,
  TriageBucket,
} from '../../console-model'

export const VIEWER = {
  initials: 'MR',
  name: 'Mara Reyes',
  email: 'mara@netkolabs.com',
} as const

export const SNOOZED_IDS = ['LOG-874', 'CW-2036']

export const DEFAULT_ASSIGNEES: Record<string, string> = {
  '#4471': VIEWER.name,
  'CW-2039': VIEWER.name,
}

export const TRIAGE_TITLES: Record<TriageBucket, { title: string; sub: string }> = {
  inbox: { title: 'Needs review', sub: 'sorted by impact' },
  assigned: { title: 'Assigned to me', sub: 'you own these' },
  snoozed: { title: 'Snoozed', sub: 'back when they fire again' },
}

export const NOTIFICATIONS: ConsoleNotification[] = [
  {
    title: 'CW-2041 is a regression — 3,104 users hit in 18 minutes',
    when: '18m ago',
    severity: 'critical',
    unread: true,
    itemId: 'CW-2041',
  },
  {
    title: 'Jamie Doss requested your review on #4471',
    when: '52m ago',
    severity: 'info',
    unread: true,
    itemId: '#4471',
  },
  {
    title: 'p95 latency on /v2/ingest crossed its threshold',
    when: '1h ago',
    severity: 'warning',
    unread: true,
    itemId: 'LOG-882',
  },
  {
    title: 'Whiskers approved #4468 with no findings',
    when: '6h ago',
    severity: 'idle',
    unread: false,
    itemId: '#4468',
  },
]

export const ORGS: ConsoleOrg[] = [
  { name: 'Netko Labs', meta: '14 repositories', mono: 'NL', tint: '#e4e4e7' },
  { name: 'Netko OSS', meta: '6 repositories · public', mono: 'NO', tint: '#a3e635' },
  { name: 'Mara Reyes', meta: 'Personal · 2 repositories', mono: 'MR', tint: '#93c5fd' },
]

export const TEAM: ConsoleTeammate[] = [
  { initials: 'MR', name: 'Mara Reyes', role: 'On call · platform' },
  { initials: 'JD', name: 'Jamie Doss', role: 'Author of #4471' },
  { initials: 'AK', name: 'Ada Kwan', role: 'Billing' },
  { initials: 'PL', name: 'Priya Lal', role: 'Observability' },
]

export const SEED_COMMENTS: ConsoleComment[] = [
  {
    initials: 'JD',
    who: 'Jamie Doss',
    when: '48m ago',
    body: 'Ready for a look — the fan-out is the only interesting part.',
    self: false,
  },
  {
    initials: 'CW',
    who: 'Whiskers',
    when: '46m ago',
    body: 'One blocker on src/webhooks/fanout.ts:84. Everything else looks fine to me.',
    self: true,
  },
]

export const SAMPLE_DATA_NOTE = 'Sample data — no events ingested yet'
export const SWEEP_NOTE = 'Whiskers swept 40s ago'
