import type { SectionDefinition } from '../../../shared/console-model'

export const RELEASES_SECTION: SectionDefinition = {
  title: 'Releases',
  subtitle: 'netko/api-gateway · last 6 versions',
  actions: [
    { label: 'Compare', variant: 'outline' },
    { label: 'Create release', variant: 'solid' },
  ],
  stats: [
    { label: 'Current', value: 'v4.18.2', note: 'deployed 4h ago' },
    { label: 'Crash-free', value: '99.1%', note: '−0.4 vs v4.18.1' },
    { label: 'New issues', value: '3', note: '1 regression' },
    { label: 'Adoption', value: '100%', note: 'all instances' },
  ],
  tabs: ['All', 'Production', 'Staging'],
  table: {
    grid: '130px 150px 1fr 110px 130px 110px',
    columns: [
      { label: 'Version' },
      { label: 'Deployed' },
      { label: 'Crash-free sessions' },
      { label: 'New issues' },
      { label: 'Regressions' },
      { label: 'Adoption', align: 'end' },
    ],
    rows: [
      [
        { kind: 'text', text: 'v4.18.2', mono: true, strong: true, dot: 'warning' },
        { kind: 'text', text: '4h ago · Mara', tone: 'muted' },
        { kind: 'bar', percent: 91, tone: 'warn', note: '99.1%' },
        { kind: 'text', text: '3', mono: true },
        { kind: 'text', text: '1', mono: true, tone: 'bad' },
        { kind: 'text', text: '100%', mono: true, align: 'end' },
      ],
      [
        { kind: 'text', text: 'v4.18.1', mono: true, strong: true, dot: 'ok' },
        { kind: 'text', text: '2d ago · Jamie', tone: 'muted' },
        { kind: 'bar', percent: 99, tone: 'ok', note: '99.5%' },
        { kind: 'text', text: '1', mono: true },
        { kind: 'text', text: '0', tone: 'muted' },
        { kind: 'text', text: '—', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'v4.18.0', mono: true, strong: true, dot: 'ok' },
        { kind: 'text', text: '5d ago · Priya', tone: 'muted' },
        { kind: 'bar', percent: 97, tone: 'ok', note: '99.4%' },
        { kind: 'text', text: '6', mono: true },
        { kind: 'text', text: '1', mono: true },
        { kind: 'text', text: '—', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'v4.17.6', mono: true, strong: true, dot: 'ok' },
        { kind: 'text', text: '11d ago · Ada', tone: 'muted' },
        { kind: 'bar', percent: 96, tone: 'ok', note: '99.3%' },
        { kind: 'text', text: '4', mono: true },
        { kind: 'text', text: '1', mono: true },
        { kind: 'text', text: '—', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'v4.17.5', mono: true, strong: true, dot: 'idle' },
        { kind: 'text', text: '18d ago · Sam', tone: 'muted' },
        { kind: 'bar', percent: 94, tone: 'neutral', note: '99.0%' },
        { kind: 'text', text: '9', mono: true },
        { kind: 'text', text: '2', mono: true },
        { kind: 'text', text: '—', tone: 'muted', align: 'end' },
      ],
    ],
    footer: 'Crash-free is computed from sessions reported by the SDK, not from error counts',
  },
}

export const ALERT_RULES_SECTION: SectionDefinition = {
  title: 'Alert rules',
  subtitle: 'Structured thresholds over errors, logs, and traces',
  actions: [
    { label: 'Test rule', variant: 'outline' },
    { label: 'New alert rule', variant: 'solid' },
  ],
  stats: [
    { label: 'Active rules', value: '11', note: '3 paging' },
    { label: 'Fired 7d', value: '18', note: '4 still open' },
    { label: 'Noisy rules', value: '1', note: 'fired 9 times' },
    { label: 'Muted', value: '2', note: 'until v4.19' },
  ],
  tabs: ['Active', 'Muted', 'Fired 7d'],
  table: {
    grid: '1fr 1fr 110px 150px 110px',
    columns: [
      { label: 'Rule' },
      { label: 'Condition' },
      { label: 'Window' },
      { label: 'Notifies' },
      { label: 'State', align: 'end' },
    ],
    rows: [
      [
        { kind: 'text', text: 'Ingest latency budget', strong: true, dot: 'warning' },
        { kind: 'text', text: 'p95(/v2/ingest) > 500ms', mono: true },
        { kind: 'text', text: '5m × 3', mono: true },
        { kind: 'text', text: '#oncall-platform', tone: 'muted' },
        { kind: 'pill', text: 'firing', tone: 'warn', align: 'end' },
      ],
      [
        { kind: 'text', text: 'New critical issue', strong: true, dot: 'critical' },
        { kind: 'text', text: 'level:error AND users > 500', mono: true },
        { kind: 'text', text: 'instant', mono: true },
        { kind: 'text', text: 'PagerDuty · platform', tone: 'muted' },
        { kind: 'pill', text: 'firing', tone: 'bad', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Crash-free below target', strong: true, dot: 'ok' },
        { kind: 'text', text: 'crash_free < 99.5%', mono: true },
        { kind: 'text', text: '30m', mono: true },
        { kind: 'text', text: '#eng-releases', tone: 'muted' },
        { kind: 'pill', text: 'armed', tone: 'ok', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Queue depth', strong: true, dot: 'ok' },
        { kind: 'text', text: 'queue.depth > 2000', mono: true },
        { kind: 'text', text: '10m', mono: true },
        { kind: 'text', text: '#oncall-platform', tone: 'muted' },
        { kind: 'pill', text: 'armed', tone: 'ok', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Deprecation noise', strong: true, dot: 'idle' },
        { kind: 'text', text: 'count(level:warn) > 10000', mono: true },
        { kind: 'text', text: '1h', mono: true },
        { kind: 'text', text: 'email · Priya', tone: 'muted' },
        { kind: 'pill', text: 'muted', tone: 'neutral', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Vendor timeouts', strong: true, dot: 'ok' },
        { kind: 'text', text: 'error.type:TimeoutError > 100', mono: true },
        { kind: 'text', text: '15m', mono: true },
        { kind: 'text', text: '#payments', tone: 'muted' },
        { kind: 'pill', text: 'armed', tone: 'ok', align: 'end' },
      ],
    ],
    footer: 'Alert rules are thresholds; what Whiskers looks for in code lives in review rules',
  },
}
