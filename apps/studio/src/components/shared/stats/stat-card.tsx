import { Skeleton } from '@code-whiskers/ui/components/skeleton'
import { cn } from '@code-whiskers/ui/lib/utils'
import { TONE_INK } from '@/components/shared/status'
import { CountUp } from './count-up'
import type { StatCardProps, StatCardSkeletonProps, StatGridProps } from './lib'
import { Sparkline } from './sparkline'

export function StatCard({
  label,
  value,
  format,
  hint,
  delta,
  trend,
  tone = 'info',
  isLoading = false,
  className,
}: StatCardProps) {
  if (isLoading) return <StatCardSkeleton className={className} />

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5 bg-background p-4', className)}>
      <span className="truncate text-2xs text-muted-foreground">{label}</span>
      <div className="flex items-end justify-between gap-3">
        <span className="truncate font-semibold text-[22px] text-foreground leading-7 tracking-[-0.015em] tabular-nums">
          {typeof value === 'number' ? <CountUp value={value} format={format} /> : value}
        </span>
        {trend && trend.length > 1 && (
          <Sparkline values={trend} tone={tone} width={80} height={24} />
        )}
      </div>
      {(delta || hint) && (
        <div className="flex min-w-0 items-center gap-2 text-2xs">
          {delta && <span className={cn('font-medium', TONE_INK[delta.tone])}>{delta.label}</span>}
          {hint && <span className="truncate text-muted-foreground">{hint}</span>}
        </div>
      )}
    </div>
  )
}

export function StatCardSkeleton({ className }: StatCardSkeletonProps) {
  return (
    <div aria-hidden className={cn('flex flex-col gap-2.5 bg-background p-4', className)}>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

/** Cards share hairlines instead of each carrying a border: one box, divided. */
export function StatGrid({ children, className }: StatGridProps) {
  return (
    <div
      className={cn(
        'stagger grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  )
}
