import type { SectionView } from '../../shared/console-model'
import { useCodebaseMapSection } from './hooks/use-codebase-map-section'
import { useInstanceSection } from './hooks/use-instance-section'
import { useIssuesSection } from './hooks/use-issues-section'
import { useMembersSection } from './hooks/use-members-section'
import { usePullRequestsSection } from './hooks/use-pull-requests-section'
import { useRepositoriesSection } from './hooks/use-repositories-section'
import { useReviewRulesSection } from './hooks/use-review-rules-section'
import type { SectionHook } from './types'
import { SECTIONS } from './values'

function sampleOf(section: SectionView): SectionHook {
  return () => ({ ...SECTIONS[section], sample: true })
}

/** One data hook per section; a section with no source yet shows its labelled fixture. */
export const SECTION_HOOKS: Record<SectionView, SectionHook> = {
  'pull-requests': usePullRequestsSection,
  repositories: useRepositoriesSection,
  'codebase-map': useCodebaseMapSection,
  'review-rules': useReviewRulesSection,
  issues: useIssuesSection,
  regressions: sampleOf('regressions'),
  releases: sampleOf('releases'),
  'alert-rules': sampleOf('alert-rules'),
  'live-logs': sampleOf('live-logs'),
  traces: sampleOf('traces'),
  services: sampleOf('services'),
  'saved-queries': sampleOf('saved-queries'),
  members: useMembersSection,
  integrations: sampleOf('integrations'),
  'api-keys': sampleOf('api-keys'),
  instance: useInstanceSection,
}

export const SECTION_SAMPLE_NOTE =
  'Sample data — this section fills in once its source has something to show'
