import { cn } from '@code-whiskers/ui/lib/utils'
import { OUTCOME_RULE, type ReviewOutcomeProps, reviewOutcome } from './lib'

/** Severity is a rule, not a fill: the brand keeps color to a line and a dot. */
export function ReviewOutcome({ review, open, className }: ReviewOutcomeProps) {
  const outcome = reviewOutcome(review, open)
  return (
    <div
      className={cn(
        'flex-col gap-0.5 border-l-2 py-0.5 pl-3.5',
        OUTCOME_RULE[outcome.tone],
        className,
      )}
    >
      <span className="font-semibold text-[15px] leading-[21px]">{outcome.title}</span>
      <span className="text-[12px] text-muted-foreground">{outcome.note}</span>
    </div>
  )
}
