import { cn } from '@code-whiskers/ui/lib/utils'
import type { LiveDotProps } from './lib'
import { SeverityDot } from './severity-dot'

/** A stream that is listening pulses; a paused one goes still and grey. */
export function LiveDot({ isLive = true, label, className }: LiveDotProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium text-2xs',
        isLive ? 'text-foreground' : 'text-muted-foreground',
        className,
      )}
    >
      <SeverityDot tone={isLive ? 'resolved' : 'neutral'} size="sm" isPulsing={isLive} />
      {label ?? (isLive ? 'Live' : 'Paused')}
    </span>
  )
}
