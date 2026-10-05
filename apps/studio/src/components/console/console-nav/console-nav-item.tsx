import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { type ConsoleNavItemProps, NAV_ICON, NAV_ROW, NAV_ROW_ACTIVE, NAV_ROW_IDLE } from './lib'

export function ConsoleNavItem({ item, count }: ConsoleNavItemProps) {
  const Icon = item.icon

  return (
    <Link
      to={item.to}
      params={item.params}
      className={cn(NAV_ROW, NAV_ROW_IDLE)}
      activeProps={{ className: cn(NAV_ROW, NAV_ROW_ACTIVE) }}
    >
      <Icon className={NAV_ICON} stroke={1.75} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {count && (
        <span className="animate-enter font-mono text-2xs text-muted-foreground tabular-nums">
          {count}
        </span>
      )}
    </Link>
  )
}
