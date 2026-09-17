import type { SectionDefinition } from '../../../shared/console-model'

export const ISSUES_SECTION: SectionDefinition = {
  title: 'Issues',
  subtitle: '28 unresolved · grouped by stack shape, not message',
  actions: [
    { label: 'Saved views', variant: 'outline' },
    { label: 'Resolve read', variant: 'solid' },
  ],
  stats: [
    { label: 'Unresolved', value: '28', note: '3 critical' },
    { label: 'Events 24h', value: '1.2M', note: '+2% vs prior' },
    { label: 'Users affected', value: '3,921', note: '2.1% of active' },
    { label: 'Crash-free', value: '99.1%', note: 'target 99.5%' },
  ],
  tabs: ['Unresolved', 'For review', 'Ignored', 'Resolved'],
  table: {
    grid: '1fr 110px 100px 130px 130px 90px',
    columns: [
      { label: 'Issue' },
      { label: 'Events' },
      { label: 'Users' },
      { label: 'Last 24h' },
      { label: 'Assignee' },
      { label: 'Age', align: 'end' },
    ],
    rows: [
      [
        {
          kind: 'text',
          text: 'TypeError: cannot read `sessionId` of undefined',
          strong: true,
          dot: 'critical',
        },
        { kind: 'text', text: '14,208', mono: true },
        { kind: 'text', text: '3,104', mono: true },
        { kind: 'bar', percent: 100, tone: 'bad' },
        { kind: 'text', text: 'Mara Reyes', tone: 'muted' },
        { kind: 'text', text: '18m', tone: 'muted', align: 'end' },
      ],
      [
        {
          kind: 'text',
          text: 'TimeoutError: upstream billing service',
          strong: true,
          dot: 'critical',
        },
        { kind: 'text', text: '2,840', mono: true },
        { kind: 'text', text: '611', mono: true },
        { kind: 'bar', percent: 24, tone: 'bad' },
        { kind: 'text', text: 'Ada Kwan', tone: 'muted' },
        { kind: 'text', text: '4h', tone: 'muted', align: 'end' },
      ],
      [
        {
          kind: 'text',
          text: 'RetryStorm: queue drain re-enqueued 940 times',
          strong: true,
          dot: 'warning',
        },
        { kind: 'text', text: '940', mono: true },
        { kind: 'text', text: '88', mono: true },
        { kind: 'bar', percent: 18, tone: 'warn' },
        { kind: 'text', text: 'Unassigned', tone: 'muted' },
        { kind: 'text', text: '7h', tone: 'muted', align: 'end' },
      ],
      [
        {
          kind: 'text',
          text: 'ValidationError: payload missing trace_id',
          strong: true,
          dot: 'warning',
        },
        { kind: 'text', text: '612', mono: true },
        { kind: 'text', text: '42', mono: true },
        { kind: 'bar', percent: 11, tone: 'warn' },
        { kind: 'text', text: 'Priya Lal', tone: 'muted' },
        { kind: 'text', text: '11h', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'RangeError in cursor paging', strong: true, dot: 'ok' },
        { kind: 'text', text: '0', tone: 'muted' },
        { kind: 'text', text: '0', tone: 'muted' },
        { kind: 'bar', percent: 2, tone: 'ok' },
        { kind: 'text', text: 'Mara Reyes', tone: 'muted' },
        { kind: 'text', text: '1d', tone: 'muted', align: 'end' },
      ],
      [
        {
          kind: 'text',
          text: 'FetchError: sdk-js failed to flush on unload',
          strong: true,
          dot: 'idle',
        },
        { kind: 'text', text: '318', mono: true },
        { kind: 'text', text: '204', mono: true },
        { kind: 'bar', percent: 6, tone: 'neutral' },
        { kind: 'text', text: 'Unassigned', tone: 'muted' },
        { kind: 'text', text: '2d', tone: 'muted', align: 'end' },
      ],
    ],
    footer:
      'Resolving starts a 24-hour quiet window — Whiskers reopens the issue if it fires again',
  },
}

export const REGRESSIONS_SECTION: SectionDefinition = {
  title: 'Regressions',
  subtitle: 'Issues that came back after being resolved',
  actions: [
    { label: 'Regression policy', variant: 'outline' },
    { label: 'Notify authors', variant: 'solid' },
  ],
  stats: [
    { label: 'Active', value: '2', note: 'both this week' },
    { label: 'Mean time to detect', value: '6m', note: 'from first event' },
    { label: 'Caught pre-merge', value: '4', note: 'by review rules' },
    { label: 'Reopened 30d', value: '9', note: '7 fixed again' },
  ],
  tabs: ['Active', 'Resolved again'],
  table: {
    grid: '1fr 130px 150px 110px 120px',
    columns: [
      { label: 'Issue' },
      { label: 'Reintroduced in' },
      { label: 'Suspect PR' },
      { label: 'Events' },
      { label: 'Since', align: 'end' },
    ],
    rows: [
      [
        {
          kind: 'text',
          text: 'TypeError: cannot read `sessionId` of undefined',
          strong: true,
          dot: 'critical',
        },
        { kind: 'text', text: 'v4.18.2', mono: true },
        { kind: 'text', text: '#4462 · a1f09c2', mono: true },
        { kind: 'text', text: '14,208', mono: true },
        { kind: 'text', text: '18m', tone: 'muted', align: 'end' },
      ],
      [
        {
          kind: 'text',
          text: 'ValidationError: payload missing trace_id',
          strong: true,
          dot: 'warning',
        },
        { kind: 'text', text: 'v4.18.0', mono: true },
        { kind: 'text', text: '#4440 · 77bd210', mono: true },
        { kind: 'text', text: '612', mono: true },
        { kind: 'text', text: '11h', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'RangeError in cursor paging', strong: true, dot: 'ok' },
        { kind: 'text', text: 'v4.17.6', mono: true },
        { kind: 'text', text: '#4402 · 5c1a908', mono: true },
        { kind: 'text', text: '0', tone: 'muted' },
        { kind: 'text', text: 'fixed 1d', tone: 'muted', align: 'end' },
      ],
    ],
    footer:
      'A regression is any issue that fires again after a resolve — Whiskers names the suspect commit',
  },
}
