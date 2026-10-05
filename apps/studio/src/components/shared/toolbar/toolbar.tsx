import { cn } from '@code-whiskers/ui/lib/utils'
import type { ToolbarProps } from './lib'

/** One row under the page header: filters left, search and sort right. Sticks while the list scrolls. */
export function Toolbar({ children, className }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      className={cn(
        'sticky top-0 z-10 flex min-h-11 shrink-0 flex-wrap items-center gap-2 border-border border-b bg-background/90 px-gutter py-2 backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function ToolbarSpacer() {
  return <span aria-hidden className="flex-1" />
}
