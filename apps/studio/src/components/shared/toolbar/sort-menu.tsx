import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@code-whiskers/ui/components/dropdown-menu'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconArrowsSort } from '@tabler/icons-react'
import { type SortMenuProps, TOOLBAR_BUTTON } from './lib'

export function SortMenu<Value extends string>({
  value,
  options,
  onValueChange,
  className,
}: SortMenuProps<Value>) {
  const current = options.find((option) => option.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<button type="button" className={cn(TOOLBAR_BUTTON, className)} />}
      >
        <IconArrowsSort className="size-3.5" stroke={1.75} />
        {current?.label ?? 'Sort'}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-auto min-w-40">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => {
            const option = options.find((candidate) => candidate.value === next)
            if (option) onValueChange(option.value)
          }}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
