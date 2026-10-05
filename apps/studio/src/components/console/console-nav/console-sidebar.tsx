import { IconLayoutSidebarLeftCollapse } from '@tabler/icons-react'
import { NAV_GROUPS, NAV_PRIMARY } from '../shared/console-data'
import { useConsoleStore } from '../use-console-store'
import { ConsoleNavGroup } from './console-nav-group'
import { ConsoleNavItem } from './console-nav-item'
import { ConsoleNavProjects } from './console-nav-projects'
import { ConsoleSearchButton } from './console-search-button'
import { ConsoleUserMenu } from './console-user-menu'
import { ConsoleWorkspaceSwitcher } from './console-workspace-switcher'
import { countFor, NAV_ICON_BUTTON, useCollapsedGroups, useNavCounts } from './lib'

/** Shares the canvas with the shell; the page sits beside it in an inset panel. */
export function ConsoleSidebar() {
  const counts = useNavCounts()
  const groups = useCollapsedGroups()

  return (
    <nav
      aria-label="Console"
      className="flex w-sidebar shrink-0 animate-enter flex-col max-lg:hidden gap-2 bg-sidebar px-2 pt-2 pb-2 text-sidebar-foreground"
    >
      <div className="flex items-center gap-1">
        <ConsoleWorkspaceSwitcher />
        <button
          type="button"
          onClick={() => useConsoleStore.getState().toggleNav()}
          aria-label="Collapse sidebar"
          title="Collapse sidebar  ["
          className={NAV_ICON_BUTTON}
        >
          <IconLayoutSidebarLeftCollapse className="size-4" stroke={1.75} />
        </button>
      </div>

      <ConsoleSearchButton />

      <div className="-mx-2 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pt-1">
        <div className="flex flex-col gap-px">
          {NAV_PRIMARY.map((item) => (
            <ConsoleNavItem key={item.label} item={item} count={countFor(counts, item)} />
          ))}
        </div>
        {NAV_GROUPS.slice(0, 3).map((group) => (
          <ConsoleNavGroup
            key={group.label}
            group={group}
            counts={counts}
            isCollapsed={groups.collapsed.has(group.label)}
            onToggle={() => groups.toggle(group.label)}
          />
        ))}
        <ConsoleNavProjects {...groups} />
        {NAV_GROUPS.slice(3).map((group) => (
          <ConsoleNavGroup
            key={group.label}
            group={group}
            counts={counts}
            isCollapsed={groups.collapsed.has(group.label)}
            onToggle={() => groups.toggle(group.label)}
          />
        ))}
      </div>

      <ConsoleUserMenu />
    </nav>
  )
}
