import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@code-whiskers/ui/components/dropdown-menu'
import { Fragment } from 'react'
import { ARCHIVE_GROUPS } from '../issue-lifecycle'
import type { IssueArchiveMenuProps } from './lib'

export function IssueArchiveMenu({
  trigger,
  onSelect,
  isOpen,
  onOpenChange,
  align = 'end',
}: IssueArchiveMenuProps) {
  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align={align} sideOffset={6} className="w-auto min-w-52">
        {ARCHIVE_GROUPS.map((group, index) => (
          <Fragment key={group.label}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
              {group.options.map((option) => (
                <DropdownMenuItem key={option.id} onClick={() => onSelect(option.choice)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
