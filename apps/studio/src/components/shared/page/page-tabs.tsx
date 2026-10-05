import { cn } from '@code-whiskers/ui/lib/utils'
import type { PageTabsProps } from './lib'

export function PageTabs({ items, label, className }: PageTabsProps) {
  return (
    <nav aria-label={label} className={cn('-mb-px flex items-center gap-5', className)}>
      {items.map((item) => (
        <button
          type="button"
          key={item.key}
          onClick={item.onSelect}
          aria-current={item.isActive ? 'page' : undefined}
          className={cn(
            'focus-ring relative flex h-10 items-center gap-1.5 text-ui transition-colors',
            item.isActive
              ? 'font-medium text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:animate-enter after:rounded-full after:bg-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span className="font-mono text-2xs text-muted-foreground tabular-nums">
              {item.count.toLocaleString()}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}
