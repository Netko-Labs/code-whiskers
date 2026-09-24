import { cn } from '@code-whiskers/ui/lib/utils'
import { formatAge } from '@/shared/format-date'
import { pushDot, type ReviewPushesProps, VERDICT_LABEL } from './lib'

/** Every push on this pull request, newest first — whether the findings went up or down. */
export function ReviewPushes({ pushes, currentId }: ReviewPushesProps) {
  if (pushes.length < 2) return null

  return (
    <div className="flex flex-col gap-2">
      <h4 className="m-0 font-medium text-[11px] text-muted-foreground">
        {pushes.length} pushes reviewed
      </h4>
      <ol className="m-0 flex list-none flex-col p-0">
        {pushes.map((push, index) => (
          <li key={push.id} className="relative flex gap-2.5 pb-3 last:pb-0">
            {index < pushes.length - 1 && (
              <span className="absolute top-3 bottom-0 left-[3.5px] w-px bg-border" />
            )}
            <span
              className={cn(
                'relative mt-[5px] size-2 shrink-0 rounded-full',
                pushDot(push),
                push.id === currentId && 'ring-2 ring-foreground/25',
              )}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-1.5 text-[12px]">
                <span className={cn('font-mono', push.id === currentId && 'font-semibold')}>
                  {push.headSha.slice(0, 7)}
                </span>
                <span className="truncate text-muted-foreground">
                  {push.status === 'failed'
                    ? 'failed'
                    : push.verdict
                      ? VERDICT_LABEL[push.verdict]
                      : push.status}
                </span>
              </span>
              <span className="text-[11px] text-faint">
                {push.findingCount} finding{push.findingCount === 1 ? '' : 's'} ·{' '}
                {formatAge(push.completedAt ?? push.createdAt)} ago
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
