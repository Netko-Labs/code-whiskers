import { useIntegrationsSection } from './hooks/use-integrations-section'
import { useLiveLogsSection } from './hooks/use-live-logs-section'
import { useSavedQueriesSection } from './hooks/use-saved-queries-section'
import { useServicesSection } from './hooks/use-services-section'
import { useTracesSection } from './hooks/use-traces-section'
import type { SectionHook, TableSectionView } from './types'

/**
 * One data hook per table section; each returns its empty definition while its source is empty.
 * Releases render their own list.
 */
export const SECTION_HOOKS: Record<Exclude<TableSectionView, 'releases'>, SectionHook> = {
  'live-logs': useLiveLogsSection,
  traces: useTracesSection,
  services: useServicesSection,
  'saved-queries': useSavedQueriesSection,
  integrations: useIntegrationsSection,
}

export const SECTION_ROW =
  'group focus-ring-inset grid min-h-row items-center gap-x-4 border-rule-soft border-b px-gutter py-2 transition-colors duration-fast hover:bg-surface-hover'
