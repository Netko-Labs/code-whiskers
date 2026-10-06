import { Popover, PopoverContent, PopoverTrigger } from '@code-whiskers/ui/components/popover'
import { IconBrandGithub, IconCheck, IconPlus, IconSelector } from '@tabler/icons-react'
import { useState } from 'react'
import type { ConsoleOrg } from '../shared/console-model'
import { useConsoleStore } from '../use-console-store'
import { MENU_ROW, useOrgChoices } from './lib'
import { WorkspaceAvatar } from './workspace-avatar'

function settingsUrl(org: ConsoleOrg): string {
  return org.isOrganization
    ? `https://github.com/organizations/${org.login}/settings/installations`
    : 'https://github.com/settings/installations'
}

/** No installation yet: the switcher becomes the one call to action that unlocks everything. */
export function ConsoleWorkspaceSwitcher() {
  const [open, setOpen] = useState(false)
  const { choices, selected: current, shown, installUrl } = useOrgChoices()

  function openExternal(url: string) {
    setOpen(false)
    window.open(url, '_blank', 'noopener')
  }

  if (!shown) {
    return (
      <button
        type="button"
        disabled={!installUrl}
        onClick={() => installUrl && openExternal(installUrl)}
        className="focus-ring flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 text-left font-medium text-nav transition-colors hover:bg-sidebar-accent disabled:opacity-60"
      >
        <IconBrandGithub className="size-4 shrink-0" stroke={1.75} />
        <span className="truncate">Connect GitHub</span>
      </button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="focus-ring flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 text-left transition-colors hover:bg-sidebar-accent aria-expanded:bg-sidebar-accent">
        <WorkspaceAvatar org={shown} />
        <span className="min-w-0 flex-1 truncate font-semibold text-foreground text-nav">
          {shown.name}
        </span>
        <IconSelector className="size-3.5 shrink-0 text-muted-foreground" stroke={1.75} />
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={6} className="w-[248px] gap-0 p-1">
        <span className="px-2 pt-1.5 pb-1 text-2xs text-muted-foreground">Organizations</span>
        {choices.map((org) => (
          <button
            type="button"
            key={org.login || 'all'}
            onClick={() => {
              setOpen(false)
              useConsoleStore.getState().pickOrg(org.login || null)
            }}
            className={MENU_ROW}
          >
            <WorkspaceAvatar org={org} />
            <span className="min-w-0 flex-1 truncate font-medium">{org.name}</span>
            {org.login === current.login && <IconCheck className="size-3.5 shrink-0" />}
          </button>
        ))}
        <div className="my-1 h-px bg-border" />
        {installUrl && (
          <button type="button" onClick={() => openExternal(installUrl)} className={MENU_ROW}>
            <IconPlus className="size-4 text-muted-foreground" stroke={1.75} />
            <span className="text-body">Install on another account</span>
          </button>
        )}
        {current.login && (
          <button
            type="button"
            onClick={() => openExternal(settingsUrl(current))}
            className={MENU_ROW}
          >
            <IconBrandGithub className="size-4 text-muted-foreground" stroke={1.75} />
            <span className="text-body">Installation settings</span>
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}
