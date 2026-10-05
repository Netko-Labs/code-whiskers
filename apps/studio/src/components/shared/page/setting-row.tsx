import { cn } from '@code-whiskers/ui/lib/utils'
import type { SettingRowProps } from './lib'

/** One setting inside a flush `Panel`: what it is on the left, its control or value on the right. */
export function SettingRow({ label, description, htmlFor, children, className }: SettingRowProps) {
  const Label = htmlFor ? 'label' : 'span'

  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-rule-soft border-b px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <Label htmlFor={htmlFor} className="font-medium text-foreground text-ui">
          {label}
        </Label>
        {description && (
          <p className="m-0 text-pretty text-2xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:max-w-[60%] sm:justify-end">
          {children}
        </div>
      )}
    </div>
  )
}
