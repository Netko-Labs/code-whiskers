import { useAlertRulesSection } from './hooks/use-alert-rules-section'
import { useApiKeysSection } from './hooks/use-api-keys-section'
import { useCodebaseMapSection } from './hooks/use-codebase-map-section'
import { useInstanceSection } from './hooks/use-instance-section'
import { useIntegrationsSection } from './hooks/use-integrations-section'
import { useLiveLogsSection } from './hooks/use-live-logs-section'
import { useMembersSection } from './hooks/use-members-section'
import { usePullRequestsSection } from './hooks/use-pull-requests-section'
import { useReleasesSection } from './hooks/use-releases-section'
import { useRepositoriesSection } from './hooks/use-repositories-section'
import { useReviewRulesSection } from './hooks/use-review-rules-section'
import { useSavedQueriesSection } from './hooks/use-saved-queries-section'
import { useServicesSection } from './hooks/use-services-section'
import { useTracesSection } from './hooks/use-traces-section'
import type { SectionHook, TableSectionView } from './types'

/** One data hook per table section; each falls back to its labelled fixture while its source is empty. */
export const SECTION_HOOKS: Record<TableSectionView, SectionHook> = {
  'pull-requests': usePullRequestsSection,
  repositories: useRepositoriesSection,
  'codebase-map': useCodebaseMapSection,
  'review-rules': useReviewRulesSection,
  releases: useReleasesSection,
  'alert-rules': useAlertRulesSection,
  'live-logs': useLiveLogsSection,
  traces: useTracesSection,
  services: useServicesSection,
  'saved-queries': useSavedQueriesSection,
  members: useMembersSection,
  integrations: useIntegrationsSection,
  'api-keys': useApiKeysSection,
  instance: useInstanceSection,
}

export const SECTION_SAMPLE_NOTE =
  'Sample data — this section fills in once its source has something to show'
