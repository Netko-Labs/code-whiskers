import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@code-whiskers/ui/components/dropdown-menu'
import { RESOLVE_OPTIONS } from '../issue-lifecycle'
import type { IssueResolveMenuProps } from './lib'

export function IssueResolveMenu({
  trigger,
  onSelect,
  isOpen,
  onOpenChange,
  align = 'end',
}: IssueResolveMenuProps) {
  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align={align} sideOffset={6} className="w-auto min-w-56">
        {RESOLVE_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.mode} onClick={() => onSelect(option.mode)}>
            {option.label}
            <DropdownMenuShortcut>{option.shortcut}</DropdownMenuShortcut>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
