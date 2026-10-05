import { cn } from '@code-whiskers/ui/lib/utils'
import type { StatusBadgeProps } from './lib'
import { SeverityDot } from './severity-dot'

/** Brand rule: the color sits in the dot, the text stays ink. */
export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-2 font-medium text-2xs text-foreground transition-colors',
        className,
      )}
    >
      <SeverityDot tone={tone} size="sm" />
      {children}
    </span>
  )
}
