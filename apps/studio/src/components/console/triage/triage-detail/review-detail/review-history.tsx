import { useQuery } from '@tanstack/react-query'
import { whiskersReviewsQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type { ConsoleItem } from '../../../shared/console-model'

const VERDICT = {
  approve: 'approved',
  request_changes: 'changes requested',
  comment: 'commented',
} as const

/** Every push on this pull request, newest first — whether the findings went up or down. */
export function ReviewHistory({ item }: { item: ConsoleItem }) {
  const { data } = useQuery({ ...whiskersReviewsQuery(), retry: false })
  const scope = item.triage?.scope.toLowerCase()
  const pushes = (data ?? []).filter(
    (review) =>
      `${review.owner}/${review.repo}`.toLowerCase() === scope &&
      `#${review.prNumber}` === item.handle,
  )
  if (pushes.length < 2) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center justify-between border-rule-soft border-b px-3.5 py-2.5">
        <span className="font-semibold text-[13px]">Pushes</span>
        <span className="text-muted-foreground text-xs">
          {pushes.length} reviews on this pull request
        </span>
      </div>
      {pushes.map((review) => (
        <div
          key={review.id}
          className="grid grid-cols-[90px_1fr_90px_90px] items-center gap-3 border-rule-soft border-b px-3.5 py-2 text-xs"
        >
          <span className="font-mono">{review.headSha.slice(0, 7)}</span>
          <span className="text-body">
            {review.status === 'failed'
              ? 'review failed'
              : review.verdict
                ? VERDICT[review.verdict]
                : review.status}
          </span>
          <span className="font-mono text-muted-foreground">
            {review.findingCount} finding{review.findingCount === 1 ? '' : 's'}
          </span>
          <span className="text-right text-muted-foreground">
            {formatAge(review.completedAt ?? review.createdAt)} ago
          </span>
        </div>
      ))}
    </div>
  )
}
