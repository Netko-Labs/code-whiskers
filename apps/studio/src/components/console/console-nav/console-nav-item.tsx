import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { type ConsoleNavItemProps, NAV_ROW, NAV_ROW_ACTIVE, NAV_ROW_IDLE } from './lib'

export function ConsoleNavItem({ item, count, isQuiet = false }: ConsoleNavItemProps) {
  const Icon = item.icon

  return (
    <Link
      to={item.to}
      params={item.params}
      className={cn(NAV_ROW, NAV_ROW_IDLE)}
      activeProps={{ className: cn(NAV_ROW, NAV_ROW_ACTIVE) }}
    >
      {!isQuiet && <Icon className="size-[15px] shrink-0" stroke={1.75} />}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {count && <span className="font-mono text-[11px] text-zinc-500 tabular-nums">{count}</span>}
    </Link>
  )
}
