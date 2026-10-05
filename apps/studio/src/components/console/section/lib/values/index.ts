import type { SectionDefinition, SectionView } from '../../../shared/console-model'
import type { IssueSectionView, TableSectionView } from '../types'
import {
  ALERT_RULES_SECTION,
  API_KEYS_SECTION,
  CODEBASE_MAP_SECTION,
  INSTANCE_SECTION,
  INTEGRATIONS_SECTION,
  LIVE_LOGS_SECTION,
  MEMBERS_SECTION,
  PULL_REQUESTS_SECTION,
  RELEASES_SECTION,
  REPOSITORIES_SECTION,
  REVIEW_RULES_SECTION,
  SAVED_QUERIES_SECTION,
  SERVICES_SECTION,
  TRACES_SECTION,
} from './empty-sections'

export {
  ALERT_RULES_SECTION,
  API_KEYS_SECTION,
  CODEBASE_MAP_SECTION,
  INSTANCE_SECTION,
  INTEGRATIONS_SECTION,
  LIVE_LOGS_SECTION,
  MEMBERS_SECTION,
  PULL_REQUESTS_SECTION,
  RELEASES_SECTION,
  REPOSITORIES_SECTION,
  REVIEW_RULES_SECTION,
  SERVICES_SECTION,
  TRACES_SECTION,
}

export const SECTIONS: Record<TableSectionView, SectionDefinition> = {
  'pull-requests': PULL_REQUESTS_SECTION,
  repositories: REPOSITORIES_SECTION,
  'codebase-map': CODEBASE_MAP_SECTION,
  'review-rules': REVIEW_RULES_SECTION,
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

export const SECTION_VIEWS: SectionView[] = [
  ...(Object.keys(SECTIONS) as TableSectionView[]),
  ...ISSUE_SECTION_VIEWS,
]
