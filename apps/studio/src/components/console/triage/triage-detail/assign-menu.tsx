import { Button } from '@code-whiskers/ui/components/button'
import { Popover, PopoverContent, PopoverTrigger } from '@code-whiskers/ui/components/popover'
import { useState } from 'react'
import { TEAM } from '../../shared/console-data'
import type { AssignMenuProps } from '../lib'

export function AssignMenu({ onAssign }: AssignMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>Assign</PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[246px] gap-0 p-1.5">
        <span className="px-2.5 pt-[7px] pb-[5px] text-[11px] text-muted-foreground">
          Assign to
        </span>
        {TEAM.map((mate) => (
          <button
            type="button"
            key={mate.name}
            onClick={() => {
              setOpen(false)
              onAssign(mate.name)
            }}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left hover:bg-rule-soft"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-semibold text-[9px]">
              {mate.initials}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="font-medium text-[13px]">{mate.name}</span>
              <span className="text-[11px] text-muted-foreground">{mate.role}</span>
            </div>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
