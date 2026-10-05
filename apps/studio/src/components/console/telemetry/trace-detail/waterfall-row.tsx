import { cn } from '@code-whiskers/ui/lib/utils'
import { IconChevronRight } from '@tabler/icons-react'
import { formatDuration } from '../shared/telemetry-time'
import { INDENT_PX, serviceFill, WATERFALL_SPLIT, type WaterfallRowProps } from './lib'

/** Name and service on the left, indented by depth; the span's bar on the shared axis right. */
export function WaterfallRow({
  row,
  isSelected,
  isCollapsed,
  onSelect,
  onToggle,
}: WaterfallRowProps) {
  const { span } = row
  const isError = span.status === 'error'
  const labelLeft = row.startPercent + row.widthPercent > 78

  return (
    <div
      role="listitem"
      className={cn(
        'group/span relative grid h-row-compact items-center border-rule-soft border-b transition-colors duration-fast hover:bg-surface-hover',
        WATERFALL_SPLIT,
        isSelected && 'bg-surface-selected',
      )}
    >
      <div
        className="flex min-w-0 items-center gap-1.5 border-rule-soft border-r pr-3"
        style={{ paddingLeft: `${12 + row.depth * INDENT_PX}px` }}
      >
        {row.childCount > 0 ? (
          <button
            type="button"
            aria-label={isCollapsed ? `Expand ${span.name}` : `Collapse ${span.name}`}
            aria-expanded={!isCollapsed}
            onClick={() => onToggle(span.spanId)}
            className="focus-ring relative z-[1] flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
          >
            <IconChevronRight
              className={cn(
                'size-3 transition-transform duration-fast',
                !isCollapsed && 'rotate-90',
              )}
              stroke={2}
            />
          </button>
        ) : (
          <span aria-hidden className="size-4 shrink-0" />
        )}
        <span
          aria-hidden
          className={cn(
            'size-2 shrink-0 rounded-[3px]',
            isError ? 'bg-severity-error' : serviceFill(row.colorIndex),
          )}
        />
        <button
          type="button"
          aria-current={isSelected ? 'true' : undefined}
          onClick={() => onSelect(span.spanId)}
          className="focus-ring-inset min-w-0 truncate text-left text-ui after:absolute after:inset-0"
        >
          <span
            className={cn('font-medium', isError ? 'text-severity-error-ink' : 'text-foreground')}
          >
            {span.name}
          </span>
          <span className="ml-2 font-mono text-2xs text-muted-foreground">{span.service}</span>
        </button>
        {isCollapsed && (
          <span className="shrink-0 rounded-sm bg-muted px-1 font-mono text-2xs text-muted-foreground">
            +{row.childCount}
          </span>
        )}
      </div>
      <div className="relative h-full px-3">
        <div className="relative h-full">
          <span
            className={cn(
              'absolute top-1/2 h-2.5 -translate-y-1/2 rounded-[3px] transition-opacity group-hover/span:opacity-100',
              isError ? 'bg-severity-error' : serviceFill(row.colorIndex),
              isSelected ? 'opacity-100' : 'opacity-85',
            )}
            style={{ left: `${row.startPercent}%`, width: `${row.widthPercent}%` }}
          />
          <span
            className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap px-1.5 font-mono text-2xs text-muted-foreground tabular-nums"
            style={
              labelLeft
                ? { right: `${100 - row.startPercent}%` }
                : { left: `${row.startPercent + row.widthPercent}%` }
            }
          >
            {formatDuration(span.durationMs)}
          </span>
        </div>
      </div>
    </div>
  )
}
