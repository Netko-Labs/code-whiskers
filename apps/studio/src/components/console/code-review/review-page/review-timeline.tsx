import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { SeverityDot } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { activityOf, pullRequestVerdict, shortSha, VERDICT_META } from '../shared/review-model'
import type { ReviewTimelineProps } from './lib'

/** Every reviewed push, newest first: what each read, what it found, what was new. */
export function ReviewTimeline({ timeline }: ReviewTimelineProps) {
  return (
    <ol aria-label="Reviewed pushes" className="stagger m-0 flex list-none flex-col p-0">
      {timeline.map(({ push, coverage, newCount, isSelected }, index) => {
        const verdict = pullRequestVerdict(push)
        const isDone = push.status === 'completed'
        return (
          <li key={push.id} className="relative pl-5">
            {index < timeline.length - 1 && (
              <span aria-hidden className="absolute top-5 bottom-0 left-[3px] w-px bg-border" />
            )}
            <SeverityDot
              tone={VERDICT_META[verdict].tone}
              isPulsing={verdict === 'running'}
              className={cn(
                'absolute top-[11px] left-0',
                isSelected && 'ring-2 ring-foreground/20 ring-offset-1 ring-offset-background',
              )}
            />
            <Link
              to="/console/reviews/$reviewId"
              params={{ reviewId: push.id }}
              aria-current={isSelected ? 'page' : undefined}
              className={cn(
                'focus-ring flex flex-col gap-0.5 rounded-md px-2 py-1.5 transition-colors duration-fast',
                isSelected ? 'bg-surface-selected' : 'hover:bg-surface-hover',
              )}
            >
              <span className="flex items-baseline gap-2 text-ui">
                <span className={cn('font-mono text-xs', isSelected && 'font-semibold')}>
                  {shortSha(push.headSha)}
                </span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {VERDICT_META[verdict].label}
                </span>
                <span className="shrink-0 font-mono text-2xs text-faint tabular-nums">
                  {formatAge(activityOf(push))}
                </span>
              </span>
              {isDone && (
                <span className="flex flex-wrap items-center gap-x-2 text-2xs text-muted-foreground">
                  <span>
                    {push.diffScope === 'delta' && push.deltaFrom
                      ? `delta since ${shortSha(push.deltaFrom)}`
                      : push.diffScope === 'full'
                        ? 'full read'
                        : 'read'}
                  </span>
                  <span className="font-mono tabular-nums">
                    {push.findingCount} {push.findingCount === 1 ? 'finding' : 'findings'}
                  </span>
                  {newCount > 0 && index < timeline.length - 1 && (
                    <span className="font-mono text-foreground tabular-nums">+{newCount} new</span>
                  )}
                  {coverage && (
                    <span className="inline-flex items-center gap-1 text-severity-warning-ink">
                      partial {coverage.total - coverage.skipped}/{coverage.total}
                    </span>
                  )}
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
