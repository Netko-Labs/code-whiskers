import type { Tone } from '@/components/shared/status'
import { TELEMETRY_LEVELS, type TelemetryLevel } from '@/integrations/whiskers'
import type { LevelBand } from './types'
import { BAND_TONE } from './values'

export function levelBandOf(level: string): LevelBand {
  const lower = level.toLowerCase()
  if (lower === 'error' || lower === 'fatal') return 'error'
  if (lower === 'warn' || lower === 'warning') return 'warn'
  if (lower === 'debug' || lower === 'trace') return 'debug'
  return 'info'
}

export function levelTone(level: string): Tone {
  return BAND_TONE[levelBandOf(level)]
}

export function isTelemetryLevel(value: unknown): value is TelemetryLevel {
  return TELEMETRY_LEVELS.some((level) => level === value)
}
