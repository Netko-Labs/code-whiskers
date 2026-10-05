import type { SectionDefinition, SectionTable } from '../../../shared/console-model'

/** What each section shows before its source has a single row: a title and the next step. */
const NO_ROWS: SectionTable = { grid: '1fr', columns: [], rows: [], footer: '' }

const BARE = { actions: [], stats: [], tabs: [], table: NO_ROWS }

const SET_UP_PROJECT = { label: 'Set up a project', href: '/console/projects/new' }
const CONNECT_REPOSITORY = { label: 'Connect a repository', href: '/console/repositories' }

export const RELEASES_SECTION: SectionDefinition = {
  ...BARE,
  title: 'Releases',
  subtitle: 'What each release brought in, read from the events that carry it',
  empty: {
    title: 'No releases reported',
    description:
      'Set release in Sentry.init and every event carries it. Each release then lists the issues it introduced.',
    action: SET_UP_PROJECT,
  },
}

export const ALERT_RULES_SECTION: SectionDefinition = {
  ...BARE,
  title: 'Alert rules',
  subtitle: 'Conditions the worker checks every minute, delivered to your webhooks',
  empty: {
    title: 'Connect GitHub first',
    description: 'Alert rules belong to an organization; install the GitHub App to create one.',
    action: CONNECT_REPOSITORY,
  },
}

export const LIVE_LOGS_SECTION: SectionDefinition = {
  ...BARE,
  title: 'Live logs',
  subtitle: 'Log lines your services send over OTLP',
  empty: {
    title: 'No logs yet',
    description:
      'Point an OpenTelemetry log exporter at /otlp with a project key, and lines stream in here.',
    action: SET_UP_PROJECT,
  },
}

export const TRACES_SECTION: SectionDefinition = {
  ...BARE,
  title: 'Traces',
  subtitle: 'Spans your services send over OTLP',
  empty: {
    title: 'No traces yet',
    description:
      'Export spans to /otlp/v1/traces with a project key and each request shows up as a waterfall.',
    action: SET_UP_PROJECT,
  },
}

export const SERVICES_SECTION: SectionDefinition = {
  ...BARE,
  title: 'Services',
  subtitle: 'Every service.name that sent telemetry today',
  empty: {
    title: 'No services reporting',
    description:
      'A service appears once logs or spans arrive carrying a service.name resource attribute.',
    action: SET_UP_PROJECT,
  },
}

export const SAVED_QUERIES_SECTION: SectionDefinition = {
  ...BARE,
  title: 'Saved queries',
  subtitle: 'Views you come back to, one click away',
}

export const INTEGRATIONS_SECTION: SectionDefinition = {
  ...BARE,
  title: 'Integrations',
  subtitle: 'Where alerts go, what sends errors in, and the GitHub App reviews run through',
}
