import { cn } from '@code-whiskers/ui/lib/utils'
import { PILL_DOT } from '../console-ui'
import { issueBadges } from '../issue-lifecycle'
import type { IssueBadgesProps } from './lib'

export function IssueBadges({ issue, hasStatus = false, className }: IssueBadgesProps) {
  const badges = issueBadges(issue, hasStatus)
  if (badges.length === 0) return null

  return (
    <span className={cn('flex shrink-0 items-center gap-1', className)}>
      {badges.map((badge) => (
        <span
          key={badge.key}
          className="inline-flex h-[18px] items-center gap-1 rounded-[5px] border border-border px-1.5 font-medium text-[10.5px] text-foreground"
        >
          <span className={cn('size-1.5 rounded-full', PILL_DOT[badge.tone])} />
          {badge.label}
        </span>
      ))}
    </span>
  )
}
