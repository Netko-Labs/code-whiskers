import { cn } from '@code-whiskers/ui/lib/utils'
import { IconChevronRight } from '@tabler/icons-react'
import { useLocation } from '@tanstack/react-router'
import { ConsoleNavItem } from './console-nav-item'
import { type ConsoleNavGroupProps, countFor, NAV_GROUP_HEADER, navPath } from './lib'

/** A folded group still shows the page you are on, so folding never hides where you are. */
export function ConsoleNavGroup({ group, counts, isCollapsed, onToggle }: ConsoleNavGroupProps) {
  const pathname = useLocation({ select: (location) => location.pathname })
  const Icon = group.icon
  const items = isCollapsed
    ? group.items.filter((item) => pathname.startsWith(navPath(item)))
    : group.items

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!isCollapsed}
        className={NAV_GROUP_HEADER}
      >
        <Icon className="size-[15px] shrink-0" stroke={1.75} />
        <span className="min-w-0 flex-1 truncate">{group.label}</span>
        <IconChevronRight
          className={cn(
            'size-3.5 shrink-0 text-zinc-600 transition-transform group-hover/header:text-zinc-400',
            !isCollapsed && 'rotate-90',
          )}
          stroke={1.75}
        />
      </button>
      {items.length > 0 && (
        <div className="ml-[17px] flex flex-col gap-0.5 border-zinc-800 border-l pl-2">
          {items.map((item) => (
            <ConsoleNavItem key={item.label} item={item} count={countFor(counts, item)} />
          ))}
        </div>
      )}
    </div>
  )
}
