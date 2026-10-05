import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@code-whiskers/ui/components/dropdown-menu'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconFilter } from '@tabler/icons-react'
import { type FilterMenuProps, TOOLBAR_BUTTON, TOOLBAR_BUTTON_ACTIVE } from './lib'

/** Multi-select facet: each option toggles; the trigger shows how many are on. */
export function FilterMenu({
  label,
  icon: Icon = IconFilter,
  options,
  selected,
  onToggle,
  className,
}: FilterMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(TOOLBAR_BUTTON, selected.length > 0 && TOOLBAR_BUTTON_ACTIVE, className)}
          />
        }
      >
        <Icon className="size-3.5" stroke={1.75} />
        {label}
        {selected.length > 0 && (
          <span className="rounded-sm bg-surface-selected px-1 font-mono tabular-nums">
            {selected.length}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6} className="max-h-72 w-auto min-w-48">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={() => onToggle(option.value)}
          >
            <span className="flex-1 truncate">{option.label}</span>
            {option.count !== undefined && (
              <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                {option.count.toLocaleString()}
              </span>
            )}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
