import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@code-whiskers/ui/components/dropdown-menu'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconChevronDown } from '@tabler/icons-react'
import { FILTER_CHIP, type FilterMenuProps } from './lib'

const ANY = '__any__'

export function IssueFilterMenu({ label, value, options, onPick }: FilterMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              FILTER_CHIP,
              value
                ? 'border-foreground/40 text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          />
        }
      >
        {label}
        {value && <span className="max-w-40 truncate font-mono">: {value}</span>}
        <IconChevronDown className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6} className="max-h-72 w-auto min-w-48">
        <DropdownMenuRadioGroup
          value={value ?? ANY}
          onValueChange={(next) => onPick(next === ANY ? undefined : String(next))}
        >
          <DropdownMenuRadioItem value={ANY}>Any {label.toLowerCase()}</DropdownMenuRadioItem>
          {options.length > 0 && <DropdownMenuSeparator />}
          {options.map((option) => (
            <DropdownMenuRadioItem key={option} value={option} className="font-mono text-[12px]">
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
