import { cn } from '@code-whiskers/ui/lib/utils'
import { TONE_TEXT } from '../../shared/console-ui'
import { crumbView, type IssueBreadcrumbsProps } from '../lib'

/** Oldest first, the throw last: a typed timeline with the time in mono on the right. */
export function IssueBreadcrumbs({ crumbs }: IssueBreadcrumbsProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {crumbs.map((crumb, index) => {
        const view = crumbView(crumb)
        const Icon = view.icon
        return (
          <div
            key={`${index}-${crumb.message}`}
            className="grid grid-cols-[20px_minmax(70px,120px)_minmax(0,1fr)_auto] items-baseline gap-3 border-rule-soft border-b px-3 py-2 last:border-b-0"
          >
            <Icon className={cn('size-3.5 translate-y-0.5', TONE_TEXT[view.tone])} stroke={1.75} />
            <span className={cn('truncate font-medium text-[12px]', TONE_TEXT[view.tone])}>
              {view.label}
            </span>
            <span className="min-w-0 break-words font-mono text-[12px]">{view.message}</span>
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {view.time}
            </span>
          </div>
        )
      })}
    </div>
  )
}
