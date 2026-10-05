import { useIntegrationsSection } from './hooks/use-integrations-section'
import type { SectionHook, TableSectionView } from './types'

/**
 * One data hook per table section; each returns its empty definition while its source is empty.
 * Releases render their own list.
 */
export const SECTION_HOOKS: Record<Exclude<TableSectionView, 'releases'>, SectionHook> = {
  integrations: useIntegrationsSection,
}

export const SECTION_ROW =
  'group focus-ring-inset grid min-h-row items-center gap-x-4 border-rule-soft border-b px-gutter py-2 transition-colors duration-fast hover:bg-surface-hover'
