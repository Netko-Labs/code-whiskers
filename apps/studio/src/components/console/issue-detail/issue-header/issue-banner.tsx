import { Button } from '@code-whiskers/ui/components/button'
import { cn } from '@code-whiskers/ui/lib/utils'
import type { IssueBannerProps } from '../lib'

const BANNER_DOT = {
  ok: 'bg-severity-resolved',
  info: 'bg-severity-info',
  warn: 'bg-severity-warning',
} as const

/** Where the issue stands after a decision, with the one action that undoes it. */
export function IssueBanner({ banner, actionLabel, onAction }: IssueBannerProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 text-[13px]">
      <span className={cn('size-2 shrink-0 rounded-full', BANNER_DOT[banner.tone])} />
      <span className="font-medium">{banner.message}</span>
      {banner.meta && <span className="text-muted-foreground">{banner.meta}</span>}
      <Button variant="ghost" size="xs" className="ml-auto" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  )
}
