import { cn } from '@code-whiskers/ui/lib/utils'
import type { KeyValueListProps, KeyValueProps } from './lib'

/** The detail-page rail: label left, value right, one hairline-free row each. */
export function KeyValueList({ children, className }: KeyValueListProps) {
  return <dl className={cn('m-0 flex flex-col gap-0.5', className)}>{children}</dl>
}

export function KeyValue({ label, children, isMono, className }: KeyValueProps) {
  return (
    <div className={cn('grid grid-cols-[112px_1fr] items-baseline gap-3 py-1.5', className)}>
      <dt className="truncate text-2xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'm-0 min-w-0 truncate text-foreground',
          isMono ? 'font-mono text-xs tabular-nums' : 'text-ui',
        )}
      >
        {children}
      </dd>
    </div>
  )
}
