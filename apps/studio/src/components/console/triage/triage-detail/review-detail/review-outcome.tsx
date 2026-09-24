import { cn } from '@code-whiskers/ui/lib/utils'
import { OUTCOME_SURFACE, type ReviewOutcomeProps, reviewOutcome } from './lib'

export function ReviewOutcome({ review, open, className }: ReviewOutcomeProps) {
  const outcome = reviewOutcome(review, open)
  return (
    <div
      className={cn(
        'flex-col gap-0.5 rounded-xl border px-3.5 py-3',
        OUTCOME_SURFACE[outcome.tone],
        className,
      )}
    >
      <span className="font-semibold text-[14px]">{outcome.title}</span>
      <span className="text-[12px] opacity-80">{outcome.note}</span>
    </div>
  )
}
