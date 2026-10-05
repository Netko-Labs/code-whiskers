import type { RangePreset } from './types'

const MINUTE = 60_000
const HOUR = 60 * MINUTE

export const RANGE_PRESETS: RangePreset[] = [
  { key: '15m', label: 'Last 15 minutes', ms: 15 * MINUTE },
  { key: '1h', label: 'Last hour', ms: HOUR },
  { key: '6h', label: 'Last 6 hours', ms: 6 * HOUR },
  { key: '24h', label: 'Last 24 hours', ms: 24 * HOUR },
  { key: '7d', label: 'Last 7 days', ms: 7 * 24 * HOUR },
]
