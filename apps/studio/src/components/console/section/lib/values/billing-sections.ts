import type { SectionDefinition } from '../../../shared/console-model'

export const USAGE_SECTION: SectionDefinition = {
  title: 'Usage & quota',
  subtitle: 'Billing period 1–30 September · Team plan',
  actions: [
    { label: 'Export usage', variant: 'outline' },
    { label: 'Adjust quota', variant: 'solid' },
  ],
  stats: [
    { label: 'Events', value: '1.2M / day', note: '98% of quota' },
    { label: 'Log lines', value: '18.4M / day', note: '74% of quota' },
    { label: 'Reviews', value: '96 / 500', note: 'this month' },
    { label: 'Overage', value: '$0', note: 'none so far' },
  ],
  tabs: ['This period', 'Last period', 'By repository'],
  table: {
    grid: '1fr 1fr 150px 130px 130px',
    columns: [
      { label: 'Meter' },
      { label: 'Used' },
      { label: 'Included' },
      { label: 'Overage rate' },
      { label: 'Trend', align: 'end' },
    ],
    rows: [
      [
        { kind: 'text', text: 'Error events', strong: true },
        { kind: 'bar', percent: 98, tone: 'warn', note: '35.4M / 36M' },
        { kind: 'text', text: '36M / month', tone: 'muted' },
        { kind: 'text', text: '$0.08 / 10K', tone: 'muted' },
        { kind: 'text', text: '+2%', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Log lines', strong: true },
        { kind: 'bar', percent: 74, tone: 'ok', note: '552M / 750M' },
        { kind: 'text', text: '750M / month', tone: 'muted' },
        { kind: 'text', text: '$0.02 / 10K', tone: 'muted' },
        { kind: 'text', text: '+9%', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Trace spans', strong: true },
        { kind: 'bar', percent: 41, tone: 'ok', note: '372M / 900M' },
        { kind: 'text', text: '900M / month', tone: 'muted' },
        { kind: 'text', text: '$0.01 / 10K', tone: 'muted' },
        { kind: 'text', text: '−4%', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Code reviews', strong: true },
        { kind: 'bar', percent: 19, tone: 'ok', note: '96 / 500' },
        { kind: 'text', text: '500 / month', tone: 'muted' },
        { kind: 'text', text: '$0.40 each', tone: 'muted' },
        { kind: 'text', text: '+12%', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Retention', strong: true },
        { kind: 'bar', percent: 100, tone: 'neutral', note: '30 of 30 days' },
        { kind: 'text', text: '30 days', tone: 'muted' },
        { kind: 'text', text: '$90 / +30d', tone: 'muted' },
        { kind: 'text', text: 'flat', tone: 'muted', align: 'end' },
      ],
    ],
    footer:
      'Quota is enforced per organization — Whiskers keeps reviewing even when ingest is capped',
  },
}

export const BILLING_SECTION: SectionDefinition = {
  title: 'Billing',
  subtitle: 'Team plan · $540 / month · renews 1 October',
  actions: [
    { label: 'Payment method', variant: 'outline' },
    { label: 'Change plan', variant: 'solid' },
  ],
  stats: [
    { label: 'Plan', value: 'Team', note: '11 of 15 seats' },
    { label: 'Next invoice', value: '$540.00', note: '1 October' },
    { label: 'Spend 90d', value: '$1,620', note: 'no overage' },
    { label: 'Payment', value: 'Visa ••4402', note: 'expires 07/28' },
  ],
  tabs: ['Invoices', 'Plans', 'Tax details'],
  table: {
    grid: '150px 1fr 130px 130px 110px',
    columns: [
      { label: 'Invoice' },
      { label: 'Period' },
      { label: 'Amount' },
      { label: 'Status' },
      { label: 'Receipt', align: 'end' },
    ],
    rows: [
      [
        { kind: 'text', text: 'INV-2026-0912', mono: true },
        { kind: 'text', text: '1–31 August 2026', tone: 'muted' },
        { kind: 'text', text: '$540.00', mono: true },
        { kind: 'pill', text: 'paid', tone: 'ok' },
        { kind: 'text', text: 'PDF', mono: true, tone: 'info', align: 'end' },
      ],
      [
        { kind: 'text', text: 'INV-2026-0811', mono: true },
        { kind: 'text', text: '1–31 July 2026', tone: 'muted' },
        { kind: 'text', text: '$540.00', mono: true },
        { kind: 'pill', text: 'paid', tone: 'ok' },
        { kind: 'text', text: 'PDF', mono: true, tone: 'info', align: 'end' },
      ],
      [
        { kind: 'text', text: 'INV-2026-0710', mono: true },
        { kind: 'text', text: '1–30 June 2026', tone: 'muted' },
        { kind: 'text', text: '$540.00', mono: true },
        { kind: 'pill', text: 'paid', tone: 'ok' },
        { kind: 'text', text: 'PDF', mono: true, tone: 'info', align: 'end' },
      ],
      [
        { kind: 'text', text: 'INV-2026-0609', mono: true },
        { kind: 'text', text: '1–31 May 2026', tone: 'muted' },
        { kind: 'text', text: '$450.00', mono: true },
        { kind: 'pill', text: 'paid', tone: 'ok' },
        { kind: 'text', text: 'PDF', mono: true, tone: 'info', align: 'end' },
      ],
      [
        { kind: 'text', text: 'INV-2026-0508', mono: true },
        { kind: 'text', text: '1–30 April 2026', tone: 'muted' },
        { kind: 'text', text: '$450.00', mono: true },
        { kind: 'pill', text: 'refunded', tone: 'neutral' },
        { kind: 'text', text: 'PDF', mono: true, tone: 'info', align: 'end' },
      ],
    ],
    footer: 'Seats are counted as members who reviewed or resolved something in the period',
  },
}
