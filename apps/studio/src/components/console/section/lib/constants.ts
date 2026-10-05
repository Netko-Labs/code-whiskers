import { useAlertRulesSection } from './hooks/use-alert-rules-section'
import { useApiKeysSection } from './hooks/use-api-keys-section'
import { useInstanceSection } from './hooks/use-instance-section'
import { useIntegrationsSection } from './hooks/use-integrations-section'
import { useLiveLogsSection } from './hooks/use-live-logs-section'
import { useMembersSection } from './hooks/use-members-section'
import { useReleasesSection } from './hooks/use-releases-section'
import { useSavedQueriesSection } from './hooks/use-saved-queries-section'
import { useServicesSection } from './hooks/use-services-section'
import { useTracesSection } from './hooks/use-traces-section'
import type { SectionHook, TableSectionView } from './types'

/** One data hook per table section; each returns its empty definition while its source is empty. */
export const SECTION_HOOKS: Record<TableSectionView, SectionHook> = {
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

export const SECTION_ROW =
  'group focus-ring-inset grid min-h-row items-center gap-x-4 border-rule-soft border-b px-gutter py-2 transition-colors duration-fast hover:bg-surface-hover'
