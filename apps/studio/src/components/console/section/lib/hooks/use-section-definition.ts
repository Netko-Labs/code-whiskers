import type { SectionDefinition, SectionView } from '../../../shared/console-model'
import { SECTIONS } from '../values'
import { usePullRequestsSection } from './use-pull-requests-section'
import { useRepositoriesSection } from './use-repositories-section'

/** Sections backed by a real endpoint read it; the rest stay declarations. */
export function useSectionDefinition(section: SectionView, tab: number): SectionDefinition {
  const pullRequests = usePullRequestsSection(tab)
  const repositories = useRepositoriesSection(tab)

  if (section === 'pull-requests') return pullRequests
  if (section === 'repositories') return repositories
  return SECTIONS[section]
}
