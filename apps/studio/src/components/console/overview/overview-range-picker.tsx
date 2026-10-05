import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { type OverviewViewProps, RANGE_OPTIONS } from './lib'

/** A segmented control of links: the range lives in the URL, so a refresh or a share keeps it. */
export function OverviewRangePicker({ range }: OverviewViewProps) {
  return (
    <nav
      aria-label="Time range"
      className="flex h-8 items-center gap-0.5 rounded-lg border border-border bg-surface-subtle p-0.5"
    >
      {RANGE_OPTIONS.map((option) => {
        const isCurrent = option.value === range
        return (
          <Link
            key={option.value}
            to="/console/overview"
            search={(prev) => ({ ...prev, range: option.value })}
            aria-current={isCurrent ? 'true' : undefined}
            title={`Show ${option.long}`}
            className={cn(
              'focus-ring flex h-full items-center rounded-md px-2.5 font-mono text-2xs tabular-nums transition-colors duration-fast',
              isCurrent
                ? 'bg-background text-foreground shadow-raised'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </Link>
        )
      })}
    </nav>
  )
}
