import type { SectionDefinition, SectionTable } from '../../../shared/console-model'

const MAP_OWNERSHIP: SectionTable = {
  grid: '1fr 170px 130px 110px 120px',
  columns: [
    { label: 'Directory' },
    { label: 'Owning team' },
    { label: 'Reviewers' },
    { label: 'Files' },
    { label: 'Routed 30d', align: 'end' },
  ],
  rows: [
    [
      { kind: 'text', text: 'src/auth/**', mono: true },
      { kind: 'text', text: 'Identity', strong: true },
      { kind: 'text', text: 'Mara, Ada', tone: 'muted' },
      { kind: 'text', text: '64', mono: true },
      { kind: 'text', text: '38', mono: true, align: 'end' },
    ],
    [
      { kind: 'text', text: 'src/webhooks/**', mono: true },
      { kind: 'text', text: 'Platform', strong: true },
      { kind: 'text', text: 'Jamie, Mara', tone: 'muted' },
      { kind: 'text', text: '41', mono: true },
      { kind: 'text', text: '52', mono: true, align: 'end' },
    ],
    [
      { kind: 'text', text: 'src/billing/**', mono: true },
      { kind: 'text', text: 'Payments', strong: true },
      { kind: 'text', text: 'Ada', tone: 'muted' },
      { kind: 'text', text: '28', mono: true },
      { kind: 'text', text: '19', mono: true, align: 'end' },
    ],
    [
      { kind: 'text', text: 'collector/exporters/**', mono: true },
      { kind: 'text', text: 'Observability', strong: true },
      { kind: 'text', text: 'Priya, Sam', tone: 'muted' },
      { kind: 'text', text: '96', mono: true },
      { kind: 'text', text: '24', mono: true, align: 'end' },
    ],
    [
      { kind: 'text', text: 'src/db/**', mono: true },
      { kind: 'text', text: 'Platform', strong: true },
      { kind: 'text', text: 'Jamie', tone: 'muted' },
      { kind: 'text', text: '52', mono: true },
      { kind: 'text', text: '31', mono: true, align: 'end' },
    ],
    [
      { kind: 'text', text: 'web/app/**', mono: true },
      { kind: 'text', text: 'Product', strong: true },
      { kind: 'text', text: 'Unassigned', tone: 'bad' },
      { kind: 'text', text: '184', mono: true },
      { kind: 'text', text: '7', mono: true, align: 'end' },
    ],
  ],
  footer: 'Ownership decides who Whiskers requests a review from',
}

const MAP_RISK: SectionTable = {
  grid: '1fr 130px 130px 1fr 110px',
  columns: [
    { label: 'File' },
    { label: 'Errors 24h' },
    { label: 'Findings 30d' },
    { label: 'Risk' },
    { label: 'Churn', align: 'end' },
  ],
  rows: [
    [
      { kind: 'text', text: 'src/auth/session.ts', mono: true },
      { kind: 'text', text: '14,208', mono: true, tone: 'bad' },
      { kind: 'text', text: '9', mono: true },
      { kind: 'bar', percent: 96, tone: 'bad', note: 'critical' },
      { kind: 'text', text: '+412', mono: true, align: 'end' },
    ],
    [
      { kind: 'text', text: 'src/webhooks/fanout.ts', mono: true },
      { kind: 'text', text: '2,104', mono: true },
      { kind: 'text', text: '7', mono: true },
      { kind: 'bar', percent: 74, tone: 'warn', note: 'high' },
      { kind: 'text', text: '+284', mono: true, align: 'end' },
    ],
    [
      { kind: 'text', text: 'src/billing/client.ts', mono: true },
      { kind: 'text', text: '2,840', mono: true },
      { kind: 'text', text: '3', mono: true },
      { kind: 'bar', percent: 61, tone: 'warn', note: 'high' },
      { kind: 'text', text: '+96', mono: true, align: 'end' },
    ],
    [
      { kind: 'text', text: 'src/db/cursor.ts', mono: true },
      { kind: 'text', text: '0', tone: 'muted' },
      { kind: 'text', text: '4', mono: true },
      { kind: 'bar', percent: 38, tone: 'neutral', note: 'medium' },
      { kind: 'text', text: '+61', mono: true, align: 'end' },
    ],
    [
      { kind: 'text', text: 'collector/exporters/otlp.go', mono: true },
      { kind: 'text', text: '9', mono: true },
      { kind: 'text', text: '2', mono: true },
      { kind: 'bar', percent: 22, tone: 'neutral', note: 'low' },
      { kind: 'text', text: '+148', mono: true, align: 'end' },
    ],
  ],
  footer: 'Risk blends error volume, review findings, and churn over 30 days',
}

const MAP_GRAPH: SectionTable = {
  grid: '1fr 160px 1fr 120px 110px',
  columns: [
    { label: 'Service' },
    { label: 'Repository' },
    { label: 'Calls' },
    { label: 'Spans 24h' },
    { label: 'Health', align: 'end' },
  ],
  rows: [
    [
      { kind: 'text', text: 'api-gateway', mono: true, strong: true },
      { kind: 'text', text: 'netko/api-gateway', tone: 'muted' },
      { kind: 'text', text: '→ auth, billing, queue', tone: 'muted' },
      { kind: 'text', text: '4.1M', mono: true },
      { kind: 'pill', text: 'degraded', tone: 'warn', align: 'end' },
    ],
    [
      { kind: 'text', text: 'auth', mono: true, strong: true },
      { kind: 'text', text: 'netko/api-gateway', tone: 'muted' },
      { kind: 'text', text: '→ postgres, redis', tone: 'muted' },
      { kind: 'text', text: '2.8M', mono: true },
      { kind: 'pill', text: 'degraded', tone: 'warn', align: 'end' },
    ],
    [
      { kind: 'text', text: 'billing', mono: true, strong: true },
      { kind: 'text', text: 'netko/api-gateway', tone: 'muted' },
      { kind: 'text', text: '→ stripe (external)', tone: 'muted' },
      { kind: 'text', text: '412K', mono: true },
      { kind: 'pill', text: 'healthy', tone: 'ok', align: 'end' },
    ],
    [
      { kind: 'text', text: 'collector', mono: true, strong: true },
      { kind: 'text', text: 'netko/collector', tone: 'muted' },
      { kind: 'text', text: '← all services', tone: 'muted' },
      { kind: 'text', text: '12.4M', mono: true },
      { kind: 'pill', text: 'healthy', tone: 'ok', align: 'end' },
    ],
    [
      { kind: 'text', text: 'retention-worker', mono: true, strong: true },
      { kind: 'text', text: 'netko/workers', tone: 'muted' },
      { kind: 'text', text: '→ postgres, s3', tone: 'muted' },
      { kind: 'text', text: '88K', mono: true },
      { kind: 'pill', text: 'healthy', tone: 'ok', align: 'end' },
    ],
  ],
  footer: 'Edges come from OTel span parentage, not configuration',
}

const MAP_DEPS: SectionTable = {
  grid: '1fr 130px 130px 140px 120px',
  columns: [
    { label: 'Package' },
    { label: 'In use' },
    { label: 'Latest' },
    { label: 'Behind' },
    { label: 'Advisories', align: 'end' },
  ],
  rows: [
    [
      { kind: 'text', text: '@opentelemetry/sdk-node', mono: true },
      { kind: 'text', text: '0.52.1', mono: true },
      { kind: 'text', text: '0.57.0', mono: true },
      { kind: 'pill', text: '5 minors', tone: 'warn' },
      { kind: 'text', text: '0', tone: 'muted', align: 'end' },
    ],
    [
      { kind: 'text', text: 'fastify', mono: true },
      { kind: 'text', text: '4.26.2', mono: true },
      { kind: 'text', text: '5.1.0', mono: true },
      { kind: 'pill', text: '1 major', tone: 'bad' },
      { kind: 'pill', text: '1 moderate', tone: 'warn', align: 'end' },
    ],
    [
      { kind: 'text', text: 'pg', mono: true },
      { kind: 'text', text: '8.11.5', mono: true },
      { kind: 'text', text: '8.13.1', mono: true },
      { kind: 'pill', text: '2 minors', tone: 'neutral' },
      { kind: 'text', text: '0', tone: 'muted', align: 'end' },
    ],
    [
      { kind: 'text', text: 'stripe', mono: true },
      { kind: 'text', text: '16.2.0', mono: true },
      { kind: 'text', text: '16.2.0', mono: true },
      { kind: 'pill', text: 'up to date', tone: 'ok' },
      { kind: 'text', text: '0', tone: 'muted', align: 'end' },
    ],
    [
      { kind: 'text', text: 'zod', mono: true },
      { kind: 'text', text: '3.23.8', mono: true },
      { kind: 'text', text: '3.24.1', mono: true },
      { kind: 'pill', text: '1 minor', tone: 'neutral' },
      { kind: 'text', text: '0', tone: 'muted', align: 'end' },
    ],
  ],
  footer: 'Whiskers opens one upgrade PR per package when you ask',
}

const MAP_OWNERSHIP_TABS = [MAP_OWNERSHIP, MAP_RISK, MAP_GRAPH, MAP_DEPS]

export const CODEBASE_MAP_SECTION: SectionDefinition = {
  title: 'Codebase map',
  subtitle: 'How the 14 repositories fit together — ownership, risk, calls, and drift',
  actions: [
    { label: 'Export CSV', variant: 'outline' },
    { label: 'Edit ownership', variant: 'solid' },
  ],
  stats: [
    { label: 'Directories mapped', value: '412', note: '6 unowned' },
    { label: 'Services', value: '12', note: 'from OTel spans' },
    { label: 'High-risk files', value: '3', note: 'errors + findings' },
    { label: 'Packages behind', value: '28', note: '1 advisory' },
  ],
  tabs: ['Ownership', 'Risk heat', 'Service graph', 'Dependencies'],
  table: (tab) => MAP_OWNERSHIP_TABS[tab] ?? MAP_OWNERSHIP,
}
