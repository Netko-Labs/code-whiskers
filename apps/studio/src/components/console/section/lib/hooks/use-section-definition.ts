import type { SectionDefinition, SectionView } from '../../../shared/console-model'
import { SECTIONS } from '../values'
import { usePullRequestsSection } from './use-pull-requests-section'

/** Sections backed by a real endpoint read it; the rest stay declarations. */
export function useSectionDefinition(section: SectionView, tab: number): SectionDefinition {
  const pullRequests = usePullRequestsSection(tab)
  return section === 'pull-requests' ? pullRequests : SECTIONS[section]
}
