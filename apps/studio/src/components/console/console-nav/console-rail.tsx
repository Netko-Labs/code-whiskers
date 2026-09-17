import { CatMark } from '@code-whiskers/ui/brand'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconBell, IconRefresh, IconSearch } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { RAIL_ITEMS, VIEWER } from '../shared/console-data'
import { useConsoleStore } from '../use-console-store'
import { NAV_SEARCH_FLASH, NAV_SEARCH_HINT } from './lib'

const RAIL_BUTTON =
  'flex size-[34px] items-center justify-center rounded-[9px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-50'

export function ConsoleRail() {
  const openNav = useConsoleStore((s) => s.openNav)

  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-3.5 bg-zinc-950 py-3.5">
      <button type="button" onClick={openNav} title="Open sidebar">
        <CatMark cut="favicon" tone="dark" background={false} size={24} label="Open sidebar" />
      </button>

      <div className="mt-1 flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={openNav}
          title="Notifications"
          className={cn(RAIL_BUTTON, 'relative')}
        >
          <IconBell className="size-4" stroke={1.75} />
          <span className="absolute top-[7px] right-[7px] size-1.5 rounded-full border-[1.5px] border-zinc-950 bg-sev-critical" />
        </button>
        <button
          type="button"
          title={NAV_SEARCH_HINT}
          onClick={() => useConsoleStore.getState().flash(NAV_SEARCH_FLASH)}
          className={RAIL_BUTTON}
        >
          <IconSearch className="size-4" stroke={1.75} />
        </button>
        <span className="my-[3px] h-px w-[22px] bg-zinc-800" />
        {RAIL_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              to={item.to}
              params={item.params}
              title={item.label}
              className={RAIL_BUTTON}
              activeProps={{ className: cn(RAIL_BUTTON, 'bg-zinc-800 text-zinc-50') }}
            >
              <Icon className="size-[17px]" stroke={1.75} />
            </Link>
          )
        })}
      </div>

      <div className="mt-auto flex flex-col items-center gap-3">
        <button
          type="button"
          title="Reset the console"
          onClick={() => {
            const { reset, flash } = useConsoleStore.getState()
            reset()
            flash('Console reset')
          }}
          className={RAIL_BUTTON}
        >
          <IconRefresh className="size-4" stroke={1.75} />
        </button>
        <span className="flex size-7 items-center justify-center rounded-full bg-zinc-50 font-semibold text-[10px] text-zinc-950">
          {VIEWER.initials}
        </span>
      </div>
    </nav>
  )
}
