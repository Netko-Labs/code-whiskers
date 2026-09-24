import { Button } from '@code-whiskers/ui/components/button'
import { Popover, PopoverContent, PopoverTrigger } from '@code-whiskers/ui/components/popover'
import { useState } from 'react'
import type { Member } from '@/integrations/studio-api'
import { useMembers } from '../../shared/console-data'
import { PersonAvatar } from '../../shared/console-ui'
import type { AssignMenuProps } from '../lib'

const ROW = 'flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left hover:bg-rule-soft'

export function AssignMenu({ assigneeUserId, isDisabled, onAssign }: AssignMenuProps) {
  const [open, setOpen] = useState(false)
  const members = useMembers()

  function pick(member: Member | null) {
    setOpen(false)
    onAssign(member)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" size="sm" disabled={isDisabled} />}>
        Assign
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[246px] gap-0 p-1.5">
        <span className="px-2.5 pt-[7px] pb-[5px] text-[11px] text-muted-foreground">
          {members.length > 0 ? 'Assign to' : 'Teammates appear after the GitHub sync'}
        </span>
        {members.map((member) => (
          <button type="button" key={member.id} onClick={() => pick(member)} className={ROW}>
            <PersonAvatar name={member.name} image={member.image} className="size-6" />
            <div className="flex min-w-0 flex-col">
              <span className="font-medium text-[13px]">{member.name}</span>
              <span className="truncate text-[11px] text-muted-foreground">
                {member.organizations.join(', ')}
              </span>
            </div>
            {member.id === assigneeUserId && <span className="ml-auto text-[11px]">✓</span>}
          </button>
        ))}
        {assigneeUserId && (
          <button type="button" onClick={() => pick(null)} className={ROW}>
            <span className="text-[13px] text-muted-foreground">Unassign</span>
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}
