import { cn } from '@code-whiskers/ui/lib/utils'
import type { SectionRowActionsProps } from './lib'
import { SectionRowFormAction } from './section-row-form-action'

const BUTTON =
  'rounded-lg border border-border bg-background px-[9px] py-[3px] font-medium text-[11px]'

export function SectionRowActions({ actions }: SectionRowActionsProps) {
  return (
    <div className="flex justify-end gap-1.5">
      {actions.map((action) =>
        action.form ? (
          <SectionRowFormAction key={action.label} action={action} className={BUTTON} />
        ) : (
          <button
            type="button"
            key={action.label}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              action.onSelect?.()
            }}
            className={cn(BUTTON, action.tone === 'danger' && 'text-severity-error-ink')}
          >
            {action.label}
          </button>
        ),
      )}
    </div>
  )
}
