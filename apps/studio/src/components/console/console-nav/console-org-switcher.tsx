import { Popover, PopoverContent, PopoverTrigger } from '@code-whiskers/ui/components/popover'
import { useState } from 'react'
import { useOrganizations } from '../shared/console-data'
import { useConsoleStore } from '../use-console-store'

export function ConsoleOrgSwitcher() {
  const [open, setOpen] = useState(false)
  const orgIndex = useConsoleStore((s) => s.orgIndex)
  const { orgs } = useOrganizations()
  const org = orgs[orgIndex] ?? orgs[0]

  function pick(index: number) {
    const { pickOrg, flash } = useConsoleStore.getState()
    setOpen(false)
    if (index === orgIndex) return
    pickOrg(index)
    flash(`Switched to ${orgs[index]?.name}`)
  }

  if (!org) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-2.5 rounded-[10px] border border-zinc-800 bg-[#141417] px-2.5 py-[7px] transition-colors hover:bg-zinc-900 aria-expanded:border-zinc-600">
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-[7px] font-bold text-[11px] text-zinc-950"
          style={{ background: org.tint }}
        >
          {org.mono}
        </span>
        <span className="min-w-0 flex-1 truncate text-left font-semibold text-[13px] text-zinc-50">
          {org.name}
        </span>
        <span className="shrink-0 text-[10px] text-zinc-500">⌄</span>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={6} className="w-[236px] gap-0 p-1.5">
        <span className="px-2.5 pt-[7px] pb-[5px] text-[11px] text-muted-foreground">
          Organizations
        </span>
        {orgs.map((candidate, index) => (
          <button
            type="button"
            key={candidate.name}
            onClick={() => pick(index)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left hover:bg-rule-soft"
          >
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-[7px] font-bold text-[11px] text-zinc-950"
              style={{ background: candidate.tint }}
            >
              {candidate.mono}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium text-[13px]">
              {candidate.name}
            </span>
            <span className="shrink-0 text-[11px]">{index === orgIndex ? '✓' : ''}</span>
          </button>
        ))}
        <div className="my-[5px] h-px bg-rule-soft" />
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            useConsoleStore.getState().flash('New organization — invite your team to start')
          }}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left hover:bg-rule-soft"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-[7px] border border-rule-strong border-dashed text-faint text-xs">
            +
          </span>
          <span className="text-[13px] text-body">Create organization</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            useConsoleStore.getState().flash('Organization settings')
          }}
          className="flex items-center justify-between rounded-lg px-2.5 py-[7px] hover:bg-rule-soft"
        >
          <span className="text-[13px] text-body">Organization settings</span>
          <span className="font-mono text-[11px] text-faint">G S</span>
        </button>
      </PopoverContent>
    </Popover>
  )
}
