import type { SectionDefinition } from '../../../shared/console-model'

export const SERVICES_SECTION: SectionDefinition = {
  title: 'Services',
  subtitle: '12 services reporting OTel spans · api-gateway and auth degraded',
  actions: [
    { label: 'Group by owner', variant: 'outline' },
    { label: 'Open service map', variant: 'solid' },
  ],
  stats: [
    { label: 'Reporting', value: '12', note: '2 degraded' },
    { label: 'Spans 24h', value: '12.4M', note: 'collector total' },
    { label: 'Error rate', value: '1.1%', note: '+0.7 vs 24h' },
    { label: 'SLO breaches', value: '1', note: 'ingest latency' },
  ],
  tabs: ['All', 'Degraded', 'My team'],
  table: {
    grid: '1fr 1fr 130px 110px 120px 130px',
    columns: [
      { label: 'Service' },
      { label: 'p95 latency' },
      { label: 'Throughput' },
      { label: 'Error rate' },
      { label: 'Version' },
      { label: 'Owner', align: 'end' },
    ],
    rows: [
      [
        { kind: 'text', text: 'api-gateway', mono: true, strong: true, dot: 'warning' },
        { kind: 'bar', percent: 82, tone: 'warn', note: '812ms' },
        { kind: 'text', text: '4.1M/day', mono: true },
        { kind: 'text', text: '1.4%', mono: true, tone: 'bad' },
        { kind: 'text', text: 'v4.18.2', mono: true },
        { kind: 'text', text: 'Platform', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'auth', mono: true, strong: true, dot: 'warning' },
        { kind: 'bar', percent: 64, tone: 'warn', note: '620ms' },
        { kind: 'text', text: '2.8M/day', mono: true },
        { kind: 'text', text: '2.1%', mono: true, tone: 'bad' },
        { kind: 'text', text: 'v4.18.2', mono: true },
        { kind: 'text', text: 'Identity', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'billing', mono: true, strong: true, dot: 'ok' },
        { kind: 'bar', percent: 44, tone: 'ok', note: '412ms' },
        { kind: 'text', text: '412K/day', mono: true },
        { kind: 'text', text: '0.6%', mono: true },
        { kind: 'text', text: 'v4.18.1', mono: true },
        { kind: 'text', text: 'Payments', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'collector', mono: true, strong: true, dot: 'ok' },
        { kind: 'bar', percent: 12, tone: 'ok', note: '88ms' },
        { kind: 'text', text: '12.4M/day', mono: true },
        { kind: 'text', text: '0.1%', mono: true },
        { kind: 'text', text: 'v2.9.0', mono: true },
        { kind: 'text', text: 'Observability', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'retention-worker', mono: true, strong: true, dot: 'ok' },
        { kind: 'bar', percent: 26, tone: 'ok', note: '244ms' },
        { kind: 'text', text: '88K/day', mono: true },
        { kind: 'text', text: '0.0%', tone: 'muted' },
        { kind: 'text', text: 'v1.4.2', mono: true },
        { kind: 'text', text: 'Platform', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'web', mono: true, strong: true, dot: 'ok' },
        { kind: 'bar', percent: 18, tone: 'ok', note: '168ms' },
        { kind: 'text', text: '960K/day', mono: true },
        { kind: 'text', text: '0.3%', mono: true },
        { kind: 'text', text: 'v9.2.0', mono: true },
        { kind: 'text', text: 'Product', tone: 'muted', align: 'end' },
      ],
    ],
    footer: 'Click a service to drill into its slowest traces',
  },
}

export const SAVED_QUERIES_SECTION: SectionDefinition = {
  title: 'Saved queries',
  subtitle: 'Shared searches across logs, traces, and issues',
  actions: [
    { label: 'Import', variant: 'outline' },
    { label: 'New query', variant: 'solid' },
  ],
  stats: [
    { label: 'Saved', value: '5', note: '3 shared' },
    { label: 'Attached alerts', value: '2', note: 'both armed' },
    { label: 'Run 7d', value: '148', note: 'mostly on call' },
    { label: 'Owners', value: '4', note: 'across 3 teams' },
  ],
  tabs: ['All', 'Mine', 'Shared with me'],
  table: {
    grid: '1fr 130px 110px 150px 110px',
    columns: [
      { label: 'Query' },
      { label: 'Surface' },
      { label: 'Alert' },
      { label: 'Shared with' },
      { label: 'Last run', align: 'end' },
    ],
    rows: [
      [
        { kind: 'text', text: 'level:error service:auth/* | group by req', mono: true },
        { kind: 'pill', text: 'Logs', tone: 'neutral' },
        { kind: 'pill', text: 'armed', tone: 'ok' },
        { kind: 'text', text: 'Platform, Identity', tone: 'muted' },
        { kind: 'text', text: '2m', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'duration_p95 > 500ms route:/v2/ingest', mono: true },
        { kind: 'pill', text: 'Traces', tone: 'neutral' },
        { kind: 'pill', text: 'firing', tone: 'warn' },
        { kind: 'text', text: 'Platform', tone: 'muted' },
        { kind: 'text', text: '6m', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'is:unresolved assigned:me sort:users', mono: true },
        { kind: 'pill', text: 'Issues', tone: 'neutral' },
        { kind: 'text', text: '—', tone: 'muted' },
        { kind: 'text', text: 'Just me', tone: 'muted' },
        { kind: 'text', text: '1h', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'error.type:TimeoutError vendor:*', mono: true },
        { kind: 'pill', text: 'Issues', tone: 'neutral' },
        { kind: 'text', text: '—', tone: 'muted' },
        { kind: 'text', text: 'Payments', tone: 'muted' },
        { kind: 'text', text: '5h', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'message:"deprecated" | group by callsite', mono: true },
        { kind: 'pill', text: 'Logs', tone: 'neutral' },
        { kind: 'pill', text: 'muted', tone: 'neutral' },
        { kind: 'text', text: 'Observability', tone: 'muted' },
        { kind: 'text', text: '1d', tone: 'muted', align: 'end' },
      ],
    ],
    footer: 'Any saved query can become an alert rule without rewriting it',
  },
}
