import { BRAND_NAME, CatMark } from '@code-whiskers/ui/brand'
import { IconRefresh, IconSearch } from '@tabler/icons-react'
import { NAV_GROUPS } from '../shared/console-data'
import { useConsoleStore } from '../use-console-store'
import { ConsoleNavGroup } from './console-nav-group'
import { ConsoleNotifications } from './console-notifications'
import { ConsoleOrgSwitcher } from './console-org-switcher'
import { ConsoleUserMenu } from './console-user-menu'
import { NAV_ICON_BUTTON, NAV_RESET_FLASH, NAV_SEARCH_FLASH, NAV_SEARCH_HINT } from './lib'

export function ConsoleNav() {
  const closeNav = useConsoleStore((s) => s.closeNav)

  return (
    <nav className="dark relative flex min-w-[196px] shrink basis-[244px] flex-col gap-3.5 bg-zinc-950 px-3 py-3.5">
      <div className="relative flex h-[30px] items-center gap-[7px] px-0.5">
        <button type="button" onClick={closeNav} title="Collapse sidebar" className="shrink-0">
          <CatMark cut="favicon" tone="dark" background={false} size={22} />
        </button>
        <span className="min-w-0 flex-1 truncate font-semibold text-[14px] text-zinc-50 tracking-[-0.015em]">
          {BRAND_NAME}
        </span>
        <ConsoleNotifications className={NAV_ICON_BUTTON} />
        <button
          type="button"
          title={NAV_SEARCH_HINT}
          onClick={() => useConsoleStore.getState().flash(NAV_SEARCH_FLASH)}
          className={NAV_ICON_BUTTON}
        >
          <IconSearch className="size-[15px]" stroke={1.75} />
        </button>
      </div>

      <ConsoleOrgSwitcher />

      <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-3.5 overflow-auto px-1">
        {NAV_GROUPS.map((group) => (
          <ConsoleNavGroup key={group.label} group={group} />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2.5 border-zinc-900 border-t pt-3">
        <button
          type="button"
          title="Reset the console"
          onClick={() => {
            const { reset, flash } = useConsoleStore.getState()
            reset()
            flash(NAV_RESET_FLASH)
          }}
          className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-left transition-colors hover:bg-zinc-800"
        >
          <IconRefresh className="size-3.5 text-zinc-500" stroke={1.75} />
          <span className="text-[13px] text-zinc-400">Reset demo</span>
        </button>
        <ConsoleUserMenu />
      </div>
    </nav>
  )
}
