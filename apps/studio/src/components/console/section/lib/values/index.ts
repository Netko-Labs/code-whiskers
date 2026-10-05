import type { SectionDefinition } from '../../../shared/console-model'
import type { IssueSectionView, SectionScreenView, TableSectionView } from '../types'
import {
  ALERT_RULES_SECTION,
  API_KEYS_SECTION,
  INSTANCE_SECTION,
  INTEGRATIONS_SECTION,
  LIVE_LOGS_SECTION,
  MEMBERS_SECTION,
  RELEASES_SECTION,
  SAVED_QUERIES_SECTION,
  SERVICES_SECTION,
  TRACES_SECTION,
} from './empty-sections'

export {
  ALERT_RULES_SECTION,
  API_KEYS_SECTION,
  INSTANCE_SECTION,
  INTEGRATIONS_SECTION,
  LIVE_LOGS_SECTION,
  MEMBERS_SECTION,
  RELEASES_SECTION,
  SERVICES_SECTION,
  TRACES_SECTION,
}

export const SECTIONS: Record<TableSectionView, SectionDefinition> = {
  releases: RELEASES_SECTION,
  'alert-rules': ALERT_RULES_SECTION,
  'live-logs': LIVE_LOGS_SECTION,
  traces: TRACES_SECTION,
  services: SERVICES_SECTION,
  'saved-queries': SAVED_QUERIES_SECTION,
  members: MEMBERS_SECTION,
  integrations: INTEGRATIONS_SECTION,
  'api-keys': API_KEYS_SECTION,
  instance: INSTANCE_SECTION,
}

export const ISSUE_SECTION_VIEWS: IssueSectionView[] = ['issues', 'regressions']

export const SECTION_VIEWS: SectionScreenView[] = [
  ...(Object.keys(SECTIONS) as TableSectionView[]),
  ...ISSUE_SECTION_VIEWS,
]
