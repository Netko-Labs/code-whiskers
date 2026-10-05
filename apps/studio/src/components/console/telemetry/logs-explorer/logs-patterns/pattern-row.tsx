import { buttonVariants } from '@code-whiskers/ui/components/button'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconFilter } from '@tabler/icons-react'
import { Sparkline } from '@/components/shared/stats'
import { TONE_INK } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { levelTone } from '../../shared/telemetry-levels'
import { formatClock } from '../../shared/telemetry-time'
import { PATTERN_GRID, type PatternRowProps, patternParts } from './lib'

export function PatternRow({ pattern, isExpanded, onToggle, onShowLines }: PatternRowProps) {
  const tone = levelTone(pattern.samples[0]?.level ?? 'info')

  return (
    <div role="listitem" className="border-rule-soft border-b">
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => onToggle(pattern.hash)}
        className={cn(
          'focus-ring-inset grid min-h-row w-full items-center gap-x-4 px-gutter py-2 text-left transition-colors duration-fast hover:bg-surface-hover',
          PATTERN_GRID,
          isExpanded && 'bg-surface-selected',
        )}
      >
        <span className="text-right font-mono text-foreground text-xs tabular-nums">
          {pattern.count.toLocaleString()}
        </span>
        <Sparkline
          values={pattern.hourly}
          variant="bars"
          width={96}
          height={18}
          tone={tone === 'neutral' ? 'info' : tone}
          label={`${pattern.count} lines across the window`}
        />
        <span className="truncate font-mono text-xs">
          {patternParts(pattern.pattern).map((part, index) => (
            <span key={index} className={part.isVariable ? 'text-faint' : 'text-foreground'}>
              {part.text}
            </span>
          ))}
        </span>
        <span className="truncate font-mono text-muted-foreground text-xs">{pattern.service}</span>
        <span className="text-right font-mono text-2xs text-muted-foreground tabular-nums">
          {formatAge(pattern.lastSeen)}
        </span>
      </button>
      {isExpanded && (
        <div className="flex animate-enter flex-col gap-3 border-rule-soft border-t bg-surface-subtle px-gutter py-3">
          <div className="dark flex flex-col rounded-lg bg-ink px-3 py-2.5 font-mono text-xs leading-5">
            {pattern.samples.map((sample, index) => (
              <div key={index} className="grid grid-cols-[92px_40px_1fr] gap-x-3">
                <span className="text-ink-muted tabular-nums">{formatClock(sample.timestamp)}</span>
                <span className={cn('uppercase', TONE_INK[levelTone(sample.level)])}>
                  {sample.level.slice(0, 4)}
                </span>
                <span className="min-w-0 break-words text-ink-text">{sample.message}</span>
              </div>
            ))}
          </div>
          <div>
            <button
              type="button"
              onClick={() => onShowLines(pattern)}
              className={buttonVariants({ size: 'sm', variant: 'outline' })}
            >
              <IconFilter className="size-3.5" stroke={1.75} />
              Show these lines
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
