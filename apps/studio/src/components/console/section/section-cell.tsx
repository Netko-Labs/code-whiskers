import { cn } from '@code-whiskers/ui/lib/utils'
import { BAR_TONE, ConsolePill, SeverityDot, TONE_TEXT } from '../shared/console-ui'
import type { SectionCellProps } from './lib'

export function SectionCell({ cell }: SectionCellProps) {
  const justify = cell.align === 'end' ? 'justify-end' : 'justify-start'

  if (cell.kind === 'pill') {
    return (
      <div className={cn('flex min-w-0 items-center', justify)}>
        <ConsolePill tone={cell.tone}>{cell.text}</ConsolePill>
      </div>
    )
  }

  if (cell.kind === 'bar') {
    return (
      <div className={cn('flex min-w-0 items-center gap-2', justify)}>
        <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
          <span
            className={cn('block h-full rounded-full', BAR_TONE[cell.tone])}
            style={{ width: `${cell.percent}%` }}
          />
        </span>
        {cell.note && (
          <span className="shrink-0 whitespace-nowrap text-[11px] text-faint">{cell.note}</span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-2', justify)}>
      {cell.dot && <SeverityDot severity={cell.dot} />}
      <span
        className={cn(
          'min-w-0 overflow-hidden text-ellipsis leading-[18px]',
          cell.wrap ? 'whitespace-normal' : 'whitespace-nowrap',
          cell.mono ? 'font-mono text-xs' : 'text-[13px]',
          cell.strong && 'font-medium',
          TONE_TEXT[cell.tone ?? 'default'],
        )}
      >
        {cell.text}
      </span>
    </div>
  )
}
