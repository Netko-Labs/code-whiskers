import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { type ConsoleNavItemProps, NAV_ROW, NAV_ROW_ACTIVE, NAV_ROW_IDLE } from './lib'

export function ConsoleNavItem({ item }: ConsoleNavItemProps) {
  const Icon = item.icon

  return (
    <Link
      to={item.to}
      params={item.params}
      className={cn(NAV_ROW, NAV_ROW_IDLE)}
      activeProps={{ className: cn(NAV_ROW, NAV_ROW_ACTIVE) }}
    >
      <Icon className="size-[15px] shrink-0" stroke={1.75} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      <span className="font-mono text-[11px] text-zinc-400">{item.count}</span>
    </Link>
  )
}
