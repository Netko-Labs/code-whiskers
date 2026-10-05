import { cn } from '@code-whiskers/ui/lib/utils'
import { IconChevronRight } from '@tabler/icons-react'
import { TONE_INK, TONE_RULE } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { levelTone } from '../../shared/telemetry-levels'
import { formatClock, formatStamp } from '../../shared/telemetry-time'
import type { LogRowProps } from '../lib'
import { STREAM_GRID } from './lib'
import { LogRowDetail } from './log-row-detail'

/** One line: clock time (full stamp and age on hover), level, service, message. Click to open. */
export function LogRow({ line, isFresh, isExpanded, onToggle, onFilter }: LogRowProps) {
  const tone = levelTone(line.level)

  return (
    <div
      role="listitem"
      className={cn(
        'border-rule-soft border-b [contain-intrinsic-size:auto_30px] [content-visibility:auto]',
        isFresh && 'animate-highlight',
      )}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => onToggle(line.id)}
        className={cn(
          'group/log focus-ring-inset relative grid min-h-row-compact w-full items-baseline gap-x-3 px-gutter py-1.5 text-left font-mono text-xs transition-colors duration-fast hover:bg-surface-hover',
          'before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full',
          STREAM_GRID,
          TONE_RULE[tone],
          isExpanded && 'bg-surface-selected',
        )}
      >
        <time
          dateTime={line.timestamp.toISOString()}
          title={`${formatStamp(line.timestamp)} · ${formatAge(line.timestamp)} ago`}
          className="text-muted-foreground tabular-nums"
        >
          {formatClock(line.timestamp)}
        </time>
        <span className={cn('uppercase', TONE_INK[tone])}>{line.level.slice(0, 4)}</span>
        <span className="truncate text-muted-foreground">{line.service}</span>
        <span className="flex min-w-0 items-baseline gap-2">
          <span
            className={cn(
              'min-w-0 flex-1 text-foreground',
              isExpanded ? 'whitespace-pre-wrap break-words' : 'truncate',
            )}
          >
            {line.message}
          </span>
          <IconChevronRight
            aria-hidden
            className={cn(
              'size-3 shrink-0 self-center text-faint opacity-0 transition-[opacity,transform] duration-fast group-hover/log:opacity-100',
              isExpanded && 'rotate-90 opacity-100',
            )}
            stroke={2}
          />
        </span>
      </button>
      {isExpanded && <LogRowDetail line={line} onFilter={onFilter} />}
    </div>
  )
}
