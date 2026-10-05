import { cn } from '@code-whiskers/ui/lib/utils'
import type { PanelProps, SectionProps } from './lib'

/** A hairline box for a group of related content; never nest one panel in another. */
export function Panel({ title, description, actions, children, isFlush, className }: PanelProps) {
  const hasHeader = title || description || actions

  return (
    <section className={cn('flex flex-col rounded-xl border border-border bg-card', className)}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 border-border border-b px-4 py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            {title && <h2 className="m-0 font-semibold text-foreground text-ui">{title}</h2>}
            {description && <p className="m-0 text-2xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn('flex min-w-0 flex-col', !isFlush && 'p-4')}>{children}</div>
    </section>
  )
}

/** An unboxed heading + content block: detail pages and settings stack these. */
export function Section({ title, description, actions, children, className }: SectionProps) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="m-0 font-semibold text-foreground text-ui">{title}</h2>
          {description && (
            <p className="m-0 text-pretty text-muted-foreground text-ui">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  )
}
