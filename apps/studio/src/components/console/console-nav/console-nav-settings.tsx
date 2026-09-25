import { cn } from '@code-whiskers/ui/lib/utils'
import { IconChevronRight, IconSettings } from '@tabler/icons-react'
import { useLocation } from '@tanstack/react-router'
import { useState } from 'react'
import { ConsoleNavItem } from './console-nav-item'
import { type ConsoleNavSettingsProps, NAV_ROW, NAV_ROW_IDLE } from './lib'

/** Folded by default; opens by itself when the current page is one of its own. */
export function ConsoleNavSettings({ group }: ConsoleNavSettingsProps) {
  const pathname = useLocation({ select: (location) => location.pathname })
  const isHere = group.items.some(
    (item) =>
      item.params && 'section' in item.params && pathname.endsWith(`/${item.params.section}`),
  )
  const [isOpen, setOpen] = useState(isHere)
  const isShown = isOpen || isHere

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => setOpen(!isShown)}
        aria-expanded={isShown}
        className={cn(NAV_ROW, NAV_ROW_IDLE, 'w-full text-left')}
      >
        <IconSettings className="size-[15px] shrink-0" stroke={1.75} />
        <span className="min-w-0 flex-1 truncate">{group.label}</span>
        <IconChevronRight
          className={cn('size-3.5 shrink-0 transition-transform', isShown && 'rotate-90')}
          stroke={1.75}
        />
      </button>
      {isShown && (
        <div className="ml-[17px] flex flex-col gap-0.5 border-zinc-800 border-l pl-2">
          {group.items.map((item) => (
            <ConsoleNavItem key={item.label} item={item} count="" isQuiet />
          ))}
        </div>
      )}
    </div>
  )
}
