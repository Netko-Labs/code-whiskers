import type { WindowSpec } from '@/integrations/whiskers'
import type { RangeKey, RangePreset, RangeSearch } from './types'
import { RANGE_PRESETS } from './values'

const MAX_TEXT = 200

/**
 * A trimmed, bounded string from a URL value. The router JSON-parses search values, so a typed
 * `500` arrives as a number and is read back as text.
 */
export function searchText(value: unknown): string | undefined {
  const text = typeof value === 'number' && Number.isFinite(value) ? String(value) : value
  return typeof text === 'string' && text.trim() ? text.trim().slice(0, MAX_TEXT) : undefined
}

export function searchNumber(value: unknown): number | undefined {
  const number = typeof value === 'string' ? Number(value) : value
  return typeof number === 'number' && Number.isFinite(number) && number > 0 ? number : undefined
}

export function presetOf(key: RangeKey): RangePreset {
  return RANGE_PRESETS.find((preset) => preset.key === key) ?? (RANGE_PRESETS[1] as RangePreset)
}

/** An exact window needs both ends in order; half of one is dropped rather than guessed. */
export function parseRangeSearch(input: Record<string, unknown>): RangeSearch {
  const range = RANGE_PRESETS.find((preset) => preset.key === input.range)?.key
  const from = searchNumber(input.from)
  const to = searchNumber(input.to)
  if (from && to && from < to) return { from: Math.round(from), to: Math.round(to) }
  return range ? { range } : {}
}

export function isPinned(search: RangeSearch): boolean {
  return search.from !== undefined && search.to !== undefined
}

/**
 * What the queries read. A preset slides with now unless `anchor` freezes its end, which is
 * how a paused view stops moving under the reader.
 */
export function windowSpecOf(search: RangeSearch, fallback: RangeKey, anchor?: number): WindowSpec {
  if (search.from !== undefined && search.to !== undefined) {
    return { from: search.from, to: search.to }
  }
  const { ms } = presetOf(search.range ?? fallback)
  return anchor === undefined ? { sinceMs: ms } : { from: anchor - ms, to: anchor }
}

/** The same window as concrete bounds, for links that must land on exactly this slice. */
export function boundsOf(search: RangeSearch, fallback: RangeKey, now = Date.now()) {
  const spec = windowSpecOf(search, fallback)
  return 'sinceMs' in spec ? { from: now - spec.sinceMs, to: now } : spec
}

const DAY_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}

export function rangeLabel(search: RangeSearch, fallback: RangeKey): string {
  if (search.from === undefined || search.to === undefined) {
    return presetOf(search.range ?? fallback).label
  }
  const from = new Date(search.from)
  const to = new Date(search.to)
  const day = from.toLocaleDateString(undefined, DAY_FORMAT)
  const sameDay = from.toDateString() === to.toDateString()
  const fromTime = from.toLocaleTimeString(undefined, TIME_FORMAT)
  const toTime = to.toLocaleTimeString(undefined, TIME_FORMAT)
  return sameDay
    ? `${day}, ${fromTime} – ${toTime}`
    : `${day}, ${fromTime} – ${to.toLocaleDateString(undefined, DAY_FORMAT)}, ${toTime}`
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return '0ms'
  if (ms < 1) return `${ms.toFixed(2)}ms`
  if (ms < 10) return `${ms.toFixed(1)}ms`
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)}s`
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`
}

/** `14:02:07.381`: what a log line shows; the full date sits in its tooltip. */
export function formatClock(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false,
  })
}

export function formatStamp(date: Date): string {
  return `${date.toLocaleDateString(undefined, { year: 'numeric', ...DAY_FORMAT })} ${formatClock(date)}`
}
