import { cn } from '@code-whiskers/ui/lib/utils'
import type { SegmentedProps, SegmentValue } from './lib'

/** A radio group drawn as one hairline pill row; the chosen segment is raised. */
export function Segmented<T extends SegmentValue>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex rounded-lg border border-border bg-surface-subtle p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const isChosen = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={isChosen}
            onClick={() => onChange(option.value)}
            className={cn(
              'focus-ring flex h-6 items-center gap-1.5 rounded-md px-2.5 text-2xs transition-colors duration-fast [&_svg]:size-3.5',
              isChosen
                ? 'bg-background font-medium text-foreground shadow-raised'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
