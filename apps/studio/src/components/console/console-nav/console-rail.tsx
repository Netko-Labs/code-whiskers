import { CatMark } from '@code-whiskers/ui/brand'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconBell, IconSearch } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { initialsOf, RAIL_ITEMS, useViewer } from '../shared/console-data'
import { useConsoleStore } from '../use-console-store'
import { NAV_SEARCH_HINT, useNotifications } from './lib'

const RAIL_BUTTON =
  'flex size-[34px] items-center justify-center rounded-[9px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-50'

export function ConsoleRail() {
  const openNav = useConsoleStore((s) => s.openNav)
  const { unreadIds } = useNotifications()
  const viewer = useViewer()

  return (
    <nav className="dark flex w-14 shrink-0 flex-col items-center gap-3.5 bg-zinc-950 py-3.5">
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
          {unreadIds.size > 0 && (
            <span className="absolute top-[7px] right-[7px] size-1.5 rounded-full border-[1.5px] border-zinc-950 bg-severity-error" />
          )}
        </button>
        <button
          type="button"
          title={NAV_SEARCH_HINT}
          onClick={() => useConsoleStore.getState().setSearchOpen(true)}
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
        <span className="flex size-7 items-center justify-center rounded-full bg-zinc-50 font-semibold text-[10px] text-zinc-950">
          {viewer ? initialsOf(viewer.name) : ''}
        </span>
      </div>
    </nav>
  )
}
