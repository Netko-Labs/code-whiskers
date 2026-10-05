import type { Tone } from '@/components/shared/status'
import type { MenuOption } from '@/components/shared/toolbar'
import type { TelemetryLevel } from '@/integrations/whiskers'
import type { LevelBand } from './types'

export const LEVEL_OPTIONS: MenuOption<TelemetryLevel>[] = [
  { value: 'fatal', label: 'Fatal' },
  { value: 'error', label: 'Error' },
  { value: 'warn', label: 'Warn' },
  { value: 'info', label: 'Info' },
  { value: 'debug', label: 'Debug' },
  { value: 'trace', label: 'Trace' },
]

/** Info and below carry no color: a calm stream is mostly uncolored. */
export const BAND_TONE: Record<LevelBand, Tone> = {
  error: 'error',
  warn: 'warning',
  info: 'neutral',
  debug: 'neutral',
}

/** Histogram fills, bottom to top: errors sit on the axis where the eye lands first. */
export const BAND_FILL: Record<LevelBand, string> = {
  error: 'fill-severity-error',
  warn: 'fill-severity-warning',
  info: 'fill-chart-1',
  debug: 'fill-muted-foreground/40',
}

export const BAND_SWATCH: Record<LevelBand, string> = {
  error: 'bg-severity-error',
  warn: 'bg-severity-warning',
  info: 'bg-chart-1',
  debug: 'bg-muted-foreground/40',
}

export const BAND_ORDER: LevelBand[] = ['error', 'warn', 'info', 'debug']

export const BAND_LABEL: Record<LevelBand, string> = {
  error: 'Error',
  warn: 'Warn',
  info: 'Info',
  debug: 'Debug',
}
