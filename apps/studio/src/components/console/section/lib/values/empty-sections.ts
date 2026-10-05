import type { SectionDefinition, SectionTable } from '../../../shared/console-model'

/** What each section shows before its source has a single row: a title and the next step. */
const NO_ROWS: SectionTable = { grid: '1fr', columns: [], rows: [], footer: '' }

const BARE = { actions: [], stats: [], tabs: [], table: NO_ROWS }

const SET_UP_PROJECT = { label: 'Set up a project', href: '/console/projects/new' }

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

export const INTEGRATIONS_SECTION: SectionDefinition = {
  ...BARE,
  title: 'Integrations',
  subtitle: 'Where alerts go, what sends errors in, and the GitHub App reviews run through',
}
