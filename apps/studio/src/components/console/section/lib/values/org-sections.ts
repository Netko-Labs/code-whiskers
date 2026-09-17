import type { SectionDefinition } from '../../../shared/console-model'

export const MEMBERS_SECTION: SectionDefinition = {
  title: 'Organization',
  subtitle: 'Netko Labs · 9 members, 11 of 15 seats used',
  actions: [
    { label: 'Roles and access', variant: 'outline' },
    { label: 'Invite members', variant: 'solid' },
  ],
  stats: [
    { label: 'Members', value: '9', note: '2 invites pending' },
    { label: 'Seats', value: '11 / 15', note: 'Team plan' },
    { label: 'Admins', value: '3', note: 'incl. you' },
    { label: 'SSO', value: 'Off', note: 'available on Team' },
  ],
  tabs: ['Members', 'Invites', 'Teams'],
  table: {
    grid: '1fr 1fr 130px 110px 110px',
    columns: [
      { label: 'Member' },
      { label: 'Email' },
      { label: 'Role' },
      { label: 'Teams' },
      { label: 'Last active', align: 'end' },
    ],
    rows: [
      [
        { kind: 'text', text: 'Mara Reyes', strong: true },
        { kind: 'text', text: 'mara@netkolabs.com', tone: 'muted' },
        { kind: 'pill', text: 'Admin', tone: 'neutral' },
        { kind: 'text', text: 'Platform', tone: 'muted' },
        { kind: 'text', text: 'now', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Jamie Doss', strong: true },
        { kind: 'text', text: 'jamie@netkolabs.com', tone: 'muted' },
        { kind: 'pill', text: 'Member', tone: 'neutral' },
        { kind: 'text', text: 'Platform', tone: 'muted' },
        { kind: 'text', text: '12m', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Ada Kwan', strong: true },
        { kind: 'text', text: 'ada@netkolabs.com', tone: 'muted' },
        { kind: 'pill', text: 'Admin', tone: 'neutral' },
        { kind: 'text', text: 'Payments', tone: 'muted' },
        { kind: 'text', text: '1h', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Priya Lal', strong: true },
        { kind: 'text', text: 'priya@netkolabs.com', tone: 'muted' },
        { kind: 'pill', text: 'Member', tone: 'neutral' },
        { kind: 'text', text: 'Observability', tone: 'muted' },
        { kind: 'text', text: '3h', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Sam Ito', strong: true },
        { kind: 'text', text: 'sam@netkolabs.com', tone: 'muted' },
        { kind: 'pill', text: 'Member', tone: 'neutral' },
        { kind: 'text', text: 'Observability', tone: 'muted' },
        { kind: 'text', text: '1d', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'dev@netkolabs.com', tone: 'muted' },
        { kind: 'text', text: 'invite sent 2d ago', tone: 'muted' },
        { kind: 'pill', text: 'Member', tone: 'neutral' },
        { kind: 'text', text: '—', tone: 'muted' },
        { kind: 'pill', text: 'pending', tone: 'warn', align: 'end' },
      ],
    ],
    footer: 'Admins can change review rules and alert routing for the whole organization',
  },
}

export const INTEGRATIONS_SECTION: SectionDefinition = {
  title: 'Integrations',
  subtitle: 'Where CodeWhiskers reads code and sends signal',
  actions: [
    { label: 'Webhook logs', variant: 'outline' },
    { label: 'Browse integrations', variant: 'solid' },
  ],
  stats: [
    { label: 'Connected', value: '4', note: '1 needs attention' },
    { label: 'Repos synced', value: '14', note: 'via GitHub app' },
    { label: 'Channels', value: '3', note: 'Slack' },
    { label: 'Paging targets', value: '1', note: 'PagerDuty' },
  ],
  tabs: ['Connected', 'Available'],
  table: {
    grid: '1fr 130px 1fr 150px 110px',
    columns: [
      { label: 'Integration' },
      { label: 'Status' },
      { label: 'Scope' },
      { label: 'Connected by' },
      { label: 'Since', align: 'end' },
    ],
    rows: [
      [
        { kind: 'text', text: 'GitHub', strong: true, dot: 'ok' },
        { kind: 'pill', text: 'connected', tone: 'ok' },
        { kind: 'text', text: '14 repositories · checks, comments', tone: 'muted' },
        { kind: 'text', text: 'Mara Reyes', tone: 'muted' },
        { kind: 'text', text: '8mo', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Slack', strong: true, dot: 'ok' },
        { kind: 'pill', text: 'connected', tone: 'ok' },
        { kind: 'text', text: '#oncall-platform, #eng-releases, #payments', tone: 'muted' },
        { kind: 'text', text: 'Priya Lal', tone: 'muted' },
        { kind: 'text', text: '6mo', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'PagerDuty', strong: true, dot: 'warning' },
        { kind: 'pill', text: 'token expiring', tone: 'warn' },
        { kind: 'text', text: 'platform escalation policy', tone: 'muted' },
        { kind: 'text', text: 'Ada Kwan', tone: 'muted' },
        { kind: 'text', text: '4mo', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'OpenTelemetry collector', strong: true, dot: 'ok' },
        { kind: 'pill', text: 'receiving', tone: 'ok' },
        { kind: 'text', text: 'OTLP/gRPC · 12 services', tone: 'muted' },
        { kind: 'text', text: 'Sam Ito', tone: 'muted' },
        { kind: 'text', text: '3mo', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'Linear', strong: true, dot: 'idle' },
        { kind: 'pill', text: 'not connected', tone: 'neutral' },
        { kind: 'text', text: 'create issues from errors', tone: 'muted' },
        { kind: 'text', text: '—', tone: 'muted' },
        { kind: 'text', text: '—', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'GitLab', strong: true, dot: 'idle' },
        { kind: 'pill', text: 'not connected', tone: 'neutral' },
        { kind: 'text', text: 'code review on self-hosted', tone: 'muted' },
        { kind: 'text', text: '—', tone: 'muted' },
        { kind: 'text', text: '—', tone: 'muted', align: 'end' },
      ],
    ],
    footer: 'Whiskers only ever comments — merge permissions are never requested',
  },
}

export const API_KEYS_SECTION: SectionDefinition = {
  title: 'API keys & SDK setup',
  subtitle: 'Keys the SDK and collector use to send events',
  actions: [
    { label: 'View SDK docs', variant: 'outline' },
    { label: 'Create key', variant: 'solid' },
  ],
  stats: [
    { label: 'Active keys', value: '4', note: '1 unused 30d' },
    { label: 'Ingest endpoint', value: 'eu-west-1', note: 'otlp.codewhiskers.dev' },
    { label: 'SDKs reporting', value: '5', note: 'node, go, web, ios, rust' },
    { label: 'Rotation', value: '90d', note: 'policy enforced' },
  ],
  tabs: ['Keys', 'SDK setup', 'Rotation log'],
  table: {
    grid: '1fr 150px 130px 130px 110px',
    columns: [
      { label: 'Key' },
      { label: 'Scope' },
      { label: 'Environment' },
      { label: 'Created' },
      { label: 'Last used', align: 'end' },
    ],
    rows: [
      [
        { kind: 'text', text: 'cw_live_7f21••••ac04', mono: true },
        { kind: 'text', text: 'ingest: events', tone: 'muted' },
        { kind: 'pill', text: 'production', tone: 'neutral' },
        { kind: 'text', text: '8mo ago', tone: 'muted' },
        { kind: 'text', text: '2s', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'cw_live_9a04••••c1b2', mono: true },
        { kind: 'text', text: 'ingest: logs, traces', tone: 'muted' },
        { kind: 'pill', text: 'production', tone: 'neutral' },
        { kind: 'text', text: '3mo ago', tone: 'muted' },
        { kind: 'text', text: '2s', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'cw_test_b1e4••••0219', mono: true },
        { kind: 'text', text: 'ingest: events', tone: 'muted' },
        { kind: 'pill', text: 'staging', tone: 'neutral' },
        { kind: 'text', text: '3mo ago', tone: 'muted' },
        { kind: 'text', text: '4h', tone: 'muted', align: 'end' },
      ],
      [
        { kind: 'text', text: 'cw_live_4c9d••••1104', mono: true },
        { kind: 'text', text: 'read: issues', tone: 'muted' },
        { kind: 'pill', text: 'production', tone: 'neutral' },
        { kind: 'text', text: '1y ago', tone: 'muted' },
        { kind: 'pill', text: '41d', tone: 'warn', align: 'end' },
      ],
    ],
    footer: 'Keys are shown once at creation — rotate rather than share',
  },
}
