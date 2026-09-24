import { cn } from '@code-whiskers/ui/lib/utils'
import type { SectionRowActionsProps } from './lib'

export function SectionRowActions({ actions }: SectionRowActionsProps) {
  return (
    <div className="flex justify-end gap-1.5">
      {actions.map((action) => (
        <button
          type="button"
          key={action.label}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            action.onSelect()
          }}
          className={cn(
            'rounded-lg border border-border bg-background px-[9px] py-[3px] font-medium text-[11px]',
            action.tone === 'danger' && 'text-severity-error-ink',
          )}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
