import { cn } from '@code-whiskers/ui/lib/utils'
import { LEVEL_RULE, type LevelRuleProps } from './lib'

export function LevelRule({ level, isMuted = false, className }: LevelRuleProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'w-[3px] shrink-0 rounded-full',
        isMuted ? 'bg-rule-strong' : (LEVEL_RULE[level] ?? 'bg-severity-warning'),
        className,
      )}
    />
  )
}
