import { cn } from '@code-whiskers/ui/lib/utils'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { SETTINGS_NAV } from '../shared/console-data'
import { SETTINGS_NAV_ROW, SETTINGS_NAV_ROW_ACTIVE } from './lib'

/** Linear's settings rail: a column on wide screens, a scrolling row of tabs on narrow ones. */
export function SettingsNav() {
  return (
    <nav
      aria-label="Settings"
      className="flex shrink-0 gap-4 overflow-x-auto border-border border-b px-gutter py-2 md:w-[220px] md:flex-col md:gap-5 md:overflow-visible md:border-r md:border-b-0 md:px-3 md:py-6"
    >
      {SETTINGS_NAV.map((group) => (
        <div key={group.label} className="flex shrink-0 gap-1 md:flex-col md:gap-px">
          <span className="hidden px-2 pb-1 font-medium text-2xs text-muted-foreground md:block">
            {group.label}
          </span>
          {group.entries.map((entry) => (
            <Link
              key={entry.to}
              to={entry.to}
              className={SETTINGS_NAV_ROW}
              activeProps={{ className: cn(SETTINGS_NAV_ROW, SETTINGS_NAV_ROW_ACTIVE) }}
            >
              <entry.icon
                className="size-4 shrink-0 text-muted-foreground transition-colors group-hover/settings:text-foreground"
                stroke={1.75}
              />
              <span className="min-w-0 flex-1 truncate">{entry.label}</span>
              {entry.isElsewhere && (
                <IconArrowUpRight
                  aria-hidden
                  className="hidden size-3.5 text-faint md:block"
                  stroke={1.75}
                />
              )}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  )
}
