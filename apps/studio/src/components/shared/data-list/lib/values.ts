import type { RovingMove, RowDensity } from './types'

export const ROW_SELECTOR = '[data-slot="data-row"]'

export const FOCUSABLE_ROW = 'a[href], button, [tabindex]'

export const ROVING_KEYS: Record<string, RovingMove> = {
  ArrowDown: 1,
  j: 1,
  ArrowUp: -1,
  k: -1,
  Home: 'first',
  End: 'last',
}

export const DATA_ROW =
  'group/row focus-ring-inset relative flex w-full min-w-0 items-center gap-3 px-gutter text-left text-foreground text-ui transition-colors duration-fast hover:bg-surface-hover data-[selected=true]:bg-surface-selected'

export const ROW_RULE =
  'before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full'

export const ROW_DENSITY: Record<RowDensity, string> = {
  default: 'h-row',
  compact: 'h-row-compact',
  auto: 'min-h-row py-2',
}

export const SKELETON_TITLE_WIDTHS = ['w-1/2', 'w-2/5', 'w-3/5', 'w-1/3', 'w-[45%]'] as const
