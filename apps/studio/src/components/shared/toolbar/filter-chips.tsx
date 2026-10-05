import { cn } from '@code-whiskers/ui/lib/utils'
import { IconX } from '@tabler/icons-react'
import type { FilterChipProps, FilterChipsProps } from './lib'

export function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex h-7 animate-enter-scale items-center overflow-hidden rounded-md border border-border bg-surface-subtle text-2xs">
      <span className="px-2 text-muted-foreground">{label}</span>
      <span className="max-w-48 truncate border-border border-l px-2 font-mono text-foreground">
        {value}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="focus-ring-inset flex h-full items-center border-border border-l px-1.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        <IconX className="size-3" stroke={2} />
      </button>
    </span>
  )
}

/** Applied filters as removable chips; renders nothing when none apply. */
export function FilterChips({ chips, onClearAll, className }: FilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {chips.map(({ key, ...chip }) => (
        <FilterChip key={key} {...chip} />
      ))}
      {onClearAll && chips.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="focus-ring rounded-sm px-1 text-2xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
