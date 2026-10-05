import type { RangeKey, RangeSearch } from '../../telemetry-time'

export type RangePickerProps = {
  search: RangeSearch
  fallback: RangeKey
  onChange: (next: RangeSearch) => void
  className?: string
}
