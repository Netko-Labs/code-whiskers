import { cn } from '@code-whiskers/ui/lib/utils'
import type { SettingsSectionProps } from './lib'

export function SettingsSection({ title, description, tone, children }: SettingsSectionProps) {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 border-border border-t pt-6',
        tone === 'danger' && 'border-l border-l-severity-error pl-4',
      )}
    >
      <div className="flex flex-col gap-1">
        <h2 className="m-0 font-semibold text-[15px]">{title}</h2>
        <p className="m-0 text-[13px] text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}
