import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@code-whiskers/ui/components/dropdown-menu'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconArrowsSort } from '@tabler/icons-react'
import { FILTER_CHIP, type IssueSortMenuProps, SORT_OPTIONS } from './lib'

export function IssueSortMenu({ value, onPick }: IssueSortMenuProps) {
  const current = SORT_OPTIONS.find((option) => option.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              FILTER_CHIP,
              'ml-auto border-border text-muted-foreground hover:text-foreground',
            )}
          />
        }
      >
        <IconArrowsSort className="size-3.5" stroke={1.75} />
        {current?.label ?? 'Last seen'}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-auto min-w-40">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => {
            const option = SORT_OPTIONS.find((candidate) => candidate.value === next)
            if (option) onPick(option.value)
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
