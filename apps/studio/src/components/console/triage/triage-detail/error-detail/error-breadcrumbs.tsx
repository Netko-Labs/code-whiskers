import { cn } from '@code-whiskers/ui/lib/utils'
import type { Breadcrumb } from '../../../shared/console-model'
import { TONE_TEXT } from '../../../shared/console-ui'

export function ErrorBreadcrumbs({ crumbs }: { crumbs: Breadcrumb[] }) {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      {crumbs.map((crumb) => (
        <div
          key={`${crumb.time}-${crumb.message}`}
          className="grid grid-cols-[92px_90px_1fr] items-baseline gap-3 border-rule-soft border-b px-4 py-[9px]"
        >
          <span className="font-mono text-[11px] text-muted-foreground">{crumb.time}</span>
          <span className={cn('font-semibold text-[11px]', TONE_TEXT[crumb.tone])}>
            {crumb.kind}
          </span>
          <span className="font-mono text-xs">{crumb.message}</span>
        </div>
      ))}
    </div>
  )
}
