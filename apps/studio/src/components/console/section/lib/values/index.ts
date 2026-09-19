import type { SectionDefinition, SectionView } from '../../../shared/console-model'
import { BILLING_SECTION, USAGE_SECTION } from './billing-sections'
import { PULL_REQUESTS_SECTION, REPOSITORIES_SECTION, REVIEW_RULES_SECTION } from './code-sections'

export { PULL_REQUESTS_SECTION }

import { CODEBASE_MAP_SECTION } from './codebase-map-section'
import { ISSUES_SECTION, REGRESSIONS_SECTION } from './error-sections'
import { API_KEYS_SECTION, INTEGRATIONS_SECTION, MEMBERS_SECTION } from './org-sections'
import { ALERT_RULES_SECTION, RELEASES_SECTION } from './release-sections'
import { SAVED_QUERIES_SECTION, SERVICES_SECTION } from './service-sections'
import { LIVE_LOGS_SECTION, TRACES_SECTION } from './telemetry-sections'

export const SECTIONS: Record<SectionView, SectionDefinition> = {
  'pull-requests': PULL_REQUESTS_SECTION,
  repositories: REPOSITORIES_SECTION,
  'codebase-map': CODEBASE_MAP_SECTION,
  'review-rules': REVIEW_RULES_SECTION,
  issues: ISSUES_SECTION,
  regressions: REGRESSIONS_SECTION,
  releases: RELEASES_SECTION,
  'alert-rules': ALERT_RULES_SECTION,
  'live-logs': LIVE_LOGS_SECTION,
  traces: TRACES_SECTION,
  services: SERVICES_SECTION,
  'saved-queries': SAVED_QUERIES_SECTION,
  members: MEMBERS_SECTION,
  integrations: INTEGRATIONS_SECTION,
  'api-keys': API_KEYS_SECTION,
  usage: USAGE_SECTION,
  billing: BILLING_SECTION,
}

export const SECTION_VIEWS = Object.keys(SECTIONS) as SectionView[]
