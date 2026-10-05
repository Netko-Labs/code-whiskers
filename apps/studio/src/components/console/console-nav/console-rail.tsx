import { Tooltip, TooltipContent, TooltipTrigger } from '@code-whiskers/ui/components/tooltip'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconLayoutSidebarLeftExpand, IconSearch } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { RAIL_ITEMS } from '../shared/console-data'
import { useConsoleStore } from '../use-console-store'
import { ConsoleUserMenu } from './console-user-menu'
import { type ClassNameProps, RAIL_BUTTON } from './lib'

/** The folded sidebar: one icon per surface, labels in tooltips. Below `lg` it is the only nav. */
export function ConsoleRail({ className }: ClassNameProps) {
  return (
    <nav
      aria-label="Console"
      className={cn(
        'flex w-rail shrink-0 flex-col items-center gap-1 bg-sidebar py-2 text-sidebar-foreground',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => useConsoleStore.getState().toggleNav()}
        aria-label="Expand sidebar"
        className={cn(RAIL_BUTTON, 'max-lg:hidden')}
      >
        <IconLayoutSidebarLeftExpand className="size-4" stroke={1.75} />
      </button>
      <button
        type="button"
        aria-label="Search"
        onClick={() => useConsoleStore.getState().setPaletteOpen(true)}
        className={RAIL_BUTTON}
      >
        <IconSearch className="size-4" stroke={1.75} />
      </button>
      <span className="my-1 h-px w-6 bg-border" />
      {RAIL_ITEMS.map((item) => (
        <Tooltip key={item.label}>
          <TooltipTrigger
            render={
              <Link
                to={item.to}
                params={item.params}
                aria-label={item.label}
                className={RAIL_BUTTON}
              />
            }
          >
            <item.icon className="size-[18px]" stroke={1.75} />
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      ))}
      <div className="mt-auto">
        <ConsoleUserMenu isCompact />
      </div>
    </nav>
  )
}
