import { cn } from '@code-whiskers/ui/lib/utils'
import { IconCheck } from '@tabler/icons-react'
import { TRIGGER_COPY } from '../shared/rule-copy'
import type { TriggerOptionProps } from './lib'

/** Issue events combine like checkboxes, the rest replace like radios: the mark's shape says which. */
export function TriggerOption({ trigger, isChosen, isCombinable, onToggle }: TriggerOptionProps) {
  const copy = TRIGGER_COPY[trigger]
  return (
    <button
      type="button"
      aria-pressed={isChosen}
      onClick={onToggle}
      className={cn(
        'focus-ring flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors duration-fast',
        isChosen
          ? 'border-foreground/30 bg-surface-selected'
          : 'border-border hover:bg-surface-hover',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center border transition-colors duration-fast',
          isCombinable ? 'rounded-[4px]' : 'rounded-full',
          isChosen ? 'border-foreground bg-foreground text-background' : 'border-border',
        )}
      >
        {isChosen && <IconCheck className="size-3 animate-enter-scale" stroke={2.5} />}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium text-foreground text-ui">{copy.label}</span>
        <span className="text-2xs text-muted-foreground">{copy.description}</span>
      </span>
    </button>
  )
}
