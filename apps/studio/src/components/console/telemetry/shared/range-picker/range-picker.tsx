import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@code-whiskers/ui/components/dropdown-menu'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconClock, IconX } from '@tabler/icons-react'
import { TOOLBAR_BUTTON, TOOLBAR_BUTTON_ACTIVE } from '@/components/shared/toolbar'
import { isPinned, RANGE_PRESETS, rangeLabel } from '../telemetry-time'
import type { RangePickerProps } from './lib'

/** Presets slide with now; a pinned window (from a drag on the chart) shows its bounds and an X. */
export function RangePicker({ search, fallback, onChange, className }: RangePickerProps) {
  const pinned = isPinned(search)
  const value = pinned ? '' : (search.range ?? fallback)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button type="button" className={cn(TOOLBAR_BUTTON, pinned && TOOLBAR_BUTTON_ACTIVE)} />
          }
        >
          <IconClock className="size-3.5" stroke={1.75} />
          <span className={cn(pinned && 'font-mono tabular-nums')}>
            {rangeLabel(search, fallback)}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} className="w-auto min-w-44">
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => {
              const preset = RANGE_PRESETS.find((candidate) => candidate.key === next)
              if (preset) onChange({ range: preset.key })
            }}
          >
            {RANGE_PRESETS.map((preset) => (
              <DropdownMenuRadioItem key={preset.key} value={preset.key}>
                {preset.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {pinned && (
        <button
          type="button"
          aria-label="Back to a sliding window"
          onClick={() => onChange({ range: search.range })}
          className="focus-ring flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <IconX className="size-3.5" stroke={1.75} />
        </button>
      )}
    </div>
  )
}
