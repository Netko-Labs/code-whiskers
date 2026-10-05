import { cn } from '@code-whiskers/ui/lib/utils'
import { IconUser } from '@tabler/icons-react'
import { FILTER_CHIP, type IssueFilterToggleProps } from './lib'

export function IssueFilterToggle({ label, isOn, onToggle }: IssueFilterToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={isOn}
      onClick={onToggle}
      className={cn(
        FILTER_CHIP,
        isOn
          ? 'border-foreground/40 text-foreground'
          : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      <IconUser className="size-3.5" stroke={1.75} />
      {label}
    </button>
  )
}
