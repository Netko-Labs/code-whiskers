import type { WhiskersFinding, WhiskersPullRequestReviews } from '@/integrations/whiskers'
import {
  basisPush,
  findingsAsOf,
  newFindingCount,
  pushCoverage,
  type ReviewedFinding,
  slugOf,
} from '../../shared/review-model'
import type { ReviewPageData, SeverityFilter, StatusFilter, SuggestionBlock } from './types'

/** The pushes come newest first; the page reads as of the chosen one. */
export function reviewPageData(
  thread: WhiskersPullRequestReviews,
  selectedId: string,
  isDismissed: (finding: WhiskersFinding) => boolean,
): ReviewPageData | null {
  const { pushes, findings } = thread
  const selected = pushes.find((push) => push.id === selectedId)
  const latest = pushes[0]
  if (!selected || !latest) return null
  const basis = basisPush(pushes, selectedId)
  const done = pushes.filter((push) => push.status === 'completed')

  return {
    slug: slugOf(selected),
    selected,
    latest,
    basis,
    findings: basis ? findingsAsOf(pushes, findings, basis, isDismissed) : [],
    timeline: pushes.map((push) => ({
      push,
      coverage: pushCoverage(push.summary),
      newCount:
        push.status === 'completed'
          ? newFindingCount(
              push,
              done.find((prior) => prior.createdAt < push.createdAt),
              findings,
            )
          : 0,
      isSelected: push.id === selectedId,
    })),
  }
}

export function visibleFindings(
  findings: ReviewedFinding[],
  status: StatusFilter,
  severity: SeverityFilter,
): ReviewedFinding[] {
  return findings.filter(
    (entry) =>
      (status === 'all' || entry.status === status) &&
      (severity === 'all' || entry.finding.severity === severity),
  )
}

const FENCE = /^```[\w-]*\n([\s\S]*?)\n?```\s*$/

/** Models fence suggestions half the time; the pane draws its own frame. */
export function suggestionBlock(suggestion: string): SuggestionBlock {
  const fenced = suggestion.trim().match(FENCE)
  const code = fenced?.[1] ?? suggestion.trim()
  return { code, isBlock: !!fenced || code.includes('\n') }
}

export function tokensLabel(input: number | null, output: number | null): string | null {
  if (input === null && output === null) return null
  return `${(input ?? 0).toLocaleString()} in · ${(output ?? 0).toLocaleString()} out`
}
