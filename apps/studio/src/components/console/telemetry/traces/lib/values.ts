import type { MenuOption } from '@/components/shared/toolbar'
import type { RangeKey } from '../../shared/telemetry-time'

export const TRACE_RANGE_FALLBACK: RangeKey = '24h'

export const MIN_DURATION_OPTIONS: MenuOption[] = [
  { value: '0', label: 'Any duration' },
  { value: '100', label: '≥ 100ms' },
  { value: '500', label: '≥ 500ms' },
  { value: '1000', label: '≥ 1s' },
  { value: '5000', label: '≥ 5s' },
]

export const SORT_OPTIONS: MenuOption<'recent' | 'slowest'>[] = [
  { value: 'recent', label: 'Newest first' },
  { value: 'slowest', label: 'Slowest first' },
]

export const TRACE_GRID =
  'grid-cols-[minmax(0,1fr)_minmax(0,140px)_minmax(120px,200px)_56px_56px_56px]'

export const SEARCH_DEBOUNCE_MS = 250
