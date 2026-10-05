import { cn } from '@code-whiskers/ui/lib/utils'
import { IconChevronRight } from '@tabler/icons-react'
import type { DataGroupHeaderProps, DataRowPartProps } from './lib'

/** Column labels above a list that reads as a table. */
export function DataListHeader({ children, className }: DataRowPartProps) {
  return (
    <div
      className={cn(
        'flex h-8 shrink-0 items-center gap-3 border-border border-b px-gutter font-medium text-2xs text-muted-foreground',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Linear-style group band: label, count, optional fold. */
export function DataGroupHeader({
  label,
  count,
  isCollapsed = false,
  onToggle,
  actions,
  className,
}: DataGroupHeaderProps) {
  const content = (
    <>
      {onToggle && (
        <IconChevronRight
          className={cn(
            'size-3.5 text-muted-foreground transition-transform duration-base',
            !isCollapsed && 'rotate-90',
          )}
          stroke={2}
        />
      )}
      <span className="font-medium text-foreground">{label}</span>
      {count !== undefined && (
        <span className="font-mono text-muted-foreground tabular-nums">
          {count.toLocaleString()}
        </span>
      )}
    </>
  )

  return (
    <div
      className={cn(
        'flex h-8 shrink-0 items-center gap-2 bg-surface-subtle px-gutter text-2xs',
        className,
      )}
    >
      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!isCollapsed}
          className="focus-ring flex items-center gap-2 rounded-sm"
        >
          {content}
        </button>
      ) : (
        content
      )}
      {actions && <span className="ml-auto flex items-center gap-1">{actions}</span>}
    </div>
  )
}
