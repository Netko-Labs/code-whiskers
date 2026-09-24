import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { whiskersReviewsQuery } from '@/integrations/whiskers'
import type { SectionDefinition, SectionFilters, SectionTable } from '../../../shared/console-model'
import { type ConsoleScope, isInScope } from '../../../shared/console-scope'
import {
  latestPerPullRequest,
  medianReviewDuration,
  reviewAge,
  reviewDiff,
  reviewSeverityDot,
  verdictCell,
} from '../utils'
import { PULL_REQUESTS_SECTION } from '../values'

const TABS = ['All', 'Needs changes', 'Clean', 'Failed'] as const
const GRID = '1fr 180px 150px 130px 130px 90px'
const COLUMNS = [
  { label: 'Pull request' },
  { label: 'Repository' },
  { label: 'Whiskers' },
  { label: 'Diff' },
  { label: 'Author' },
  { label: 'Reviewed', align: 'end' as const },
]

/** Live Pull requests section; falls back to the sample table until whiskers has reviewed anything. */
export function usePullRequestsSection(
  tab: number,
  filters: SectionFilters,
  scope: ConsoleScope,
): SectionDefinition {
  const { data } = useQuery({ ...whiskersReviewsQuery(), retry: false })

  return useMemo(() => {
    const reviews = data ?? []
    if (reviews.length === 0) return { ...PULL_REQUESTS_SECTION, sample: true }

    const needle = filters.q?.toLowerCase()
    const rows = latestPerPullRequest(reviews).filter(
      ({ review, slug }) =>
        isInScope(scope, { repository: slug }) &&
        (!needle ||
          `${slug}#${review.prNumber} ${review.title ?? ''} ${review.author ?? ''}`
            .toLowerCase()
            .includes(needle)),
    )
    const needsChanges = rows.filter((r) => r.review.verdict === 'request_changes')
    const failed = rows.filter((r) => r.review.status === 'failed')
    const findings = rows.reduce((total, r) => total + r.review.findingCount, 0)

    const visible =
      tab === 1
        ? needsChanges
        : tab === 2
          ? rows.filter((r) => r.review.status === 'completed' && r.review.findingCount === 0)
          : tab === 3
            ? failed
            : rows

    const table: SectionTable = {
      grid: GRID,
      columns: COLUMNS,
      rows: visible.map(({ review, slug }) => [
        {
          kind: 'text' as const,
          text: `#${review.prNumber} ${review.title ?? ''}`.trim(),
          strong: true,
          dot: reviewSeverityDot(review),
        },
        { kind: 'text' as const, text: slug, mono: true },
        verdictCell(review),
        { kind: 'text' as const, text: reviewDiff(review), mono: true },
        { kind: 'text' as const, text: review.author ?? '—', tone: 'muted' as const },
        {
          kind: 'text' as const,
          text: reviewAge(review),
          tone: 'muted' as const,
          align: 'end' as const,
        },
      ]),
      rowActions: visible.map(({ review, slug }) => [
        {
          label: 'GitHub',
          onSelect: () =>
            window.open(`https://github.com/${slug}/pull/${review.prNumber}`, '_blank', 'noopener'),
        },
      ]),
      rowLinks: visible.map(({ review, slug }) => ({
        kind: 'triage' as const,
        itemId: `${slug}#${review.prNumber}`,
      })),
      footer: 'Whiskers posts one review per push · never merges on your behalf',
    }

    return {
      title: 'Pull requests',
      subtitle: `${rows.length} reviewed${scope.value ? ` in ${scope.label}` : ''} · Whiskers reviews every push`,
      isScoped: true,
      actions: [{ label: 'Open triage', variant: 'solid', href: '/console/triage/inbox' }],
      stats: [
        { label: 'Pull requests', value: String(rows.length), note: 'latest review each' },
        { label: 'Needs changes', value: String(needsChanges.length), note: 'blocking findings' },
        { label: 'Median review', value: medianReviewDuration(reviews), note: 'start to verdict' },
        { label: 'Findings', value: String(findings), note: 'across latest reviews' },
      ],
      tabs: [...TABS],
      searchPlaceholder: 'Repository, title or author…',
      table,
    }
  }, [data, tab, filters.q, scope])
}
