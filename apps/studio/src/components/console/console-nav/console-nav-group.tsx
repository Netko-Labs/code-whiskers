import { cn } from '@code-whiskers/ui/lib/utils'
import { IconChevronRight } from '@tabler/icons-react'
import { useLocation } from '@tanstack/react-router'
import { ConsoleNavItem } from './console-nav-item'
import { type ConsoleNavGroupProps, countFor, isNavActive, NAV_GROUP_HEADER } from './lib'

/** A folded group still shows the page you are on, so folding never hides where you are. */
export function ConsoleNavGroup({
  group,
  counts,
  isCollapsed,
  onToggle,
  action,
}: ConsoleNavGroupProps) {
  const pathname = useLocation({ select: (location) => location.pathname })
  const items = isCollapsed
    ? group.items.filter((item) => isNavActive(item, pathname))
    : group.items

  return (
    <div className="flex flex-col gap-px">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!isCollapsed}
          className={NAV_GROUP_HEADER}
        >
          <span className="min-w-0 flex-1 truncate">{group.label}</span>
          <IconChevronRight
            className={cn(
              'size-3 shrink-0 opacity-0 transition-[opacity,transform] duration-base group-hover/header:opacity-100 group-focus-visible/header:opacity-100',
              !isCollapsed && 'rotate-90',
              isCollapsed && 'opacity-100',
            )}
            stroke={2}
          />
        </button>
        {action}
      </div>
      {items.length > 0 && (
        <div className={cn('flex flex-col gap-px', !isCollapsed && 'stagger')}>
          {items.map((item) => (
            <ConsoleNavItem key={item.label} item={item} count={countFor(counts, item)} />
          ))}
        </div>
      )}
    </div>
  )
}
