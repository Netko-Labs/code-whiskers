import type { SectionDefinition } from '../../../shared/console-model'

/**
 * Replaces the design's Billing and Usage & quota. A self-hosted instance has an
 * operator, not a customer: the numbers that matter are disk, retention and
 * whether the worker is keeping up — never an allowance or an overage rate.
 */
export const INSTANCE_SECTION: SectionDefinition = {
  title: 'Instance',
  subtitle: 'What this deployment is holding, and whether the worker is keeping up',
  actions: [
    { label: 'Retention settings', variant: 'outline' },
    { label: 'Run cleanup now', variant: 'solid' },
  ],
  stats: [
    { label: 'Database size', value: '18.4 GB', note: 'of 100 GB volume' },
    { label: 'Raw retention', value: '7 days', note: 'rollups kept 90' },
    { label: 'Ingest rate', value: '212/s', note: 'cap 500/s' },
    { label: 'Queue depth', value: '0', note: 'worker idle' },
  ],
  tabs: ['Storage', 'Throughput', 'Workers'],
  table: {
    grid: '1fr 1fr 150px 130px 130px',
    columns: [
      { label: 'Store' },
      { label: 'On disk' },
      { label: 'Rows' },
      { label: 'Retention' },
      { label: 'Oldest', align: 'end' },
    ],
    rows: [
      [
        { kind: 'text', text: 'Log lines', strong: true },
        { kind: 'bar', percent: 64, tone: 'warn', note: '11.8 GB' },
        { kind: 'text', text: '128.9M', mono: true },
        { kind: 'text', text: '7 days raw', tone: 'muted' },
        { kind: 'text', text: '7d', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Trace spans', strong: true },
        { kind: 'bar', percent: 21, tone: 'ok', note: '3.9 GB' },
        { kind: 'text', text: '41.2M', mono: true },
        { kind: 'text', text: '7 days raw', tone: 'muted' },
        { kind: 'text', text: '7d', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Error events', strong: true },
        { kind: 'bar', percent: 11, tone: 'ok', note: '2.1 GB' },
        { kind: 'text', text: '8.4M', mono: true },
        { kind: 'text', text: '30 days', tone: 'muted' },
        { kind: 'text', text: '30d', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Rollups', strong: true },
        { kind: 'bar', percent: 2, tone: 'ok', note: '0.4 GB' },
        { kind: 'text', text: '2.1M', mono: true },
        { kind: 'text', text: '90 days', tone: 'muted' },
        { kind: 'text', text: '90d', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Reviews and findings', strong: true },
        { kind: 'bar', percent: 1, tone: 'ok', note: '0.2 GB' },
        { kind: 'text', text: '31', mono: true },
        { kind: 'text', text: 'kept', tone: 'muted' },
        { kind: 'text', text: '6d', tone: 'muted', align: 'end' },
      ],
    ],
    footer: 'Retention is yours to set — nothing here is metered or billed',
  },
}
