import { Popover, PopoverContent, PopoverTrigger } from '@code-whiskers/ui/components/popover'
import { useState } from 'react'
import type { ConsoleOrg } from '../shared/console-model'
import { useConsoleStore } from '../use-console-store'
import { useOrgChoices } from './lib'

const ROW = 'flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left hover:bg-rule-soft'
function settingsUrl(org: ConsoleOrg): string {
  return org.isOrganization
    ? `https://github.com/organizations/${org.login}/settings/installations`
    : 'https://github.com/settings/installations'
}

export function ConsoleOrgSwitcher() {
  const [open, setOpen] = useState(false)
  const { choices, selected: current, shown, sample, installUrl } = useOrgChoices()

  function pick(org: ConsoleOrg) {
    setOpen(false)
    useConsoleStore.getState().pickOrg(org.login || null)
  }

  function openExternal(url: string) {
    setOpen(false)
    window.open(url, '_blank', 'noopener')
  }

  if (!shown) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-2.5 rounded-[10px] border border-zinc-800 bg-[#141417] px-2.5 py-[7px] transition-colors hover:bg-zinc-900 aria-expanded:border-zinc-600">
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-[7px] font-bold text-[11px] text-zinc-950"
          style={{ background: shown.tint }}
        >
          {shown.mono}
        </span>
        <span className="min-w-0 flex-1 truncate text-left font-semibold text-[13px] text-zinc-50">
          {shown.name}
        </span>
        <span className="shrink-0 text-[10px] text-zinc-500">⌄</span>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={6} className="w-[256px] gap-0 p-1.5">
        <span className="px-2.5 pt-[7px] pb-[5px] text-[11px] text-muted-foreground">
          {sample ? 'Sample — install the GitHub App to see yours' : 'Organizations'}
        </span>
        {choices.map((org) => (
          <button type="button" key={org.login || 'all'} onClick={() => pick(org)} className={ROW}>
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-[7px] font-bold text-[11px] text-zinc-950"
              style={{ background: org.tint }}
            >
              {org.mono}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium text-[13px]">{org.name}</span>
            <span className="shrink-0 text-[11px]">{org.login === current.login ? '✓' : ''}</span>
          </button>
        ))}
        <div className="my-[5px] h-px bg-rule-soft" />
        {installUrl && (
          <button type="button" onClick={() => openExternal(installUrl)} className={ROW}>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-[7px] border border-rule-strong border-dashed text-faint text-xs">
              +
            </span>
            <span className="text-[13px] text-body">Install on another account</span>
          </button>
        )}
        {current.login && (
          <button type="button" onClick={() => openExternal(settingsUrl(current))} className={ROW}>
            <span className="text-[13px] text-body">Installation settings on GitHub</span>
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}
