import { cn } from '@code-whiskers/ui/lib/utils'
import type { PageHeaderProps } from './lib'

export function PageHeader({
  title,
  description,
  icon,
  meta,
  actions,
  tabs,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('flex shrink-0 flex-col', tabs && 'border-border border-b', className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-gutter pt-6 pb-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <span className="mt-1 flex size-6 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-5">
              {icon}
            </span>
          )}
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="m-0 truncate font-semibold text-foreground text-title">{title}</h1>
            {description && (
              <p className="m-0 max-w-[72ch] text-pretty text-muted-foreground text-ui">
                {description}
              </p>
            )}
            {meta && (
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-2xs text-muted-foreground">
                {meta}
              </div>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {tabs && <div className="px-gutter">{tabs}</div>}
    </header>
  )
}
