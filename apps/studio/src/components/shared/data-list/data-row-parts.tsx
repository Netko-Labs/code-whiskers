import { cn } from '@code-whiskers/ui/lib/utils'
import type { DataRowPartProps } from './lib'

/** A 16px slot for a dot, avatar or icon, so titles line up down the list. */
export function DataRowLead({ children, className }: DataRowPartProps) {
  return (
    <span
      className={cn(
        'flex w-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function DataRowTitle({ children, className }: DataRowPartProps) {
  return <span className={cn('min-w-0 truncate font-medium', className)}>{children}</span>
}

export function DataRowDescription({ children, className }: DataRowPartProps) {
  return (
    <span className={cn('min-w-0 flex-1 truncate text-muted-foreground', className)}>
      {children}
    </span>
  )
}

/** Evidence: ids, counts, shas, ages. Mono and tabular so columns of numbers align. */
export function DataRowMeta({ children, className }: DataRowPartProps) {
  return (
    <span
      className={cn(
        'shrink-0 whitespace-nowrap font-mono text-2xs text-muted-foreground tabular-nums',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function DataRowTrail({ children, className }: DataRowPartProps) {
  return (
    <span className={cn('ml-auto flex shrink-0 items-center gap-3', className)}>{children}</span>
  )
}

/** Shown on hover or keyboard focus only; never the only way to reach an action. */
export function DataRowActions({ children, className }: DataRowPartProps) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-fast group-focus-within/row:opacity-100 group-hover/row:opacity-100',
        className,
      )}
    >
      {children}
    </span>
  )
}
