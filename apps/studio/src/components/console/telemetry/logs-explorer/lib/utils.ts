import {
  type LogFilterParams,
  type ProjectScope,
  TELEMETRY_LEVELS,
  type TelemetryLevel,
} from '@/integrations/whiskers'
import { isTelemetryLevel } from '../../shared/telemetry-levels'
import { parseRangeSearch, searchText } from '../../shared/telemetry-time'
import type { LogChip, LogSearch, ParsedQuery, QueryToken } from './types'
import { LEGACY_TAB_LEVELS, LEVEL_KEYS, MAX_ATTRS, SERVICE_KEYS, TRACE_KEYS } from './values'

function parseLevels(value: unknown, tab: unknown): TelemetryLevel[] | undefined {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
  const levels = [...new Set(raw.map((level) => String(level).trim().toLowerCase()))].filter(
    isTelemetryLevel,
  )
  if (levels.length) return levels
  const legacy = LEGACY_TAB_LEVELS[Number(tab) as keyof typeof LEGACY_TAB_LEVELS]
  return legacy ? [...legacy] : undefined
}

function parseAttrs(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const entries = Object.entries(value)
    .map(([key, raw]) => [searchText(key), searchText(raw)] as const)
    .filter((entry): entry is readonly [string, string] => !!entry[0] && !!entry[1])
    .slice(0, MAX_ATTRS)
  return entries.length ? Object.fromEntries(entries) : undefined
}

/** The URL is untrusted input; legacy `?tab=` and a trace id typed into `q` still land well. */
export function parseLogSearch(input: Record<string, unknown>): LogSearch {
  return cleanLogSearch({
    ...parseRangeSearch(input),
    q: searchText(input.q),
    service: searchText(input.service),
    levels: parseLevels(input.levels, input.tab),
    attrs: parseAttrs(input.attrs),
    traceId: searchText(input.traceId),
    view: input.view === 'patterns' ? 'patterns' : undefined,
    live: input.live === true || input.live === 'true' ? true : undefined,
  })
}

/** Drops empty values so URLs stay short and equal searches compare equal. */
export function cleanLogSearch(search: LogSearch): LogSearch {
  const clean: LogSearch = {}
  for (const [key, value] of Object.entries(search) as [keyof LogSearch, unknown][]) {
    if (value === undefined || value === false || value === '') continue
    if (Array.isArray(value) && value.length === 0) continue
    if (typeof value === 'object' && !Array.isArray(value) && !Object.keys(value ?? {}).length) {
      continue
    }
    Object.assign(clean, { [key]: value })
  }
  if (clean.from === undefined || clean.to === undefined) return clean
  const { live: _pinnedCannotTail, ...pinned } = clean
  return pinned
}

export function toLogFilter(search: LogSearch, projectIds: ProjectScope): LogFilterParams {
  return {
    projectIds,
    service: search.service,
    levels: search.levels,
    q: search.q,
    traceId: search.traceId,
    attrs: search.attrs,
  }
}

export function isLogSearchFiltered(search: LogSearch): boolean {
  return !!(
    search.q ||
    search.service ||
    search.levels?.length ||
    search.traceId ||
    Object.keys(search.attrs ?? {}).length
  )
}

function tokenOf(key: string, value: string): QueryToken {
  const name = key.toLowerCase()
  if (SERVICE_KEYS.includes(name)) return { kind: 'service', value }
  if (TRACE_KEYS.includes(name)) return { kind: 'trace', value }
  const level = value.toLowerCase()
  if (LEVEL_KEYS.includes(name) && isTelemetryLevel(level)) return { kind: 'level', value: level }
  return { kind: 'attr', key, value }
}

/** `key:value` words become filters; everything else is the free-text search. URLs stay text. */
export function parseQueryText(input: string): ParsedQuery {
  const tokens: QueryToken[] = []
  const words: string[] = []
  for (const word of input.match(/(?:[^\s"]+|"[^"]*")+/g) ?? []) {
    const match = word.match(/^([\w.-]+):(?!\/\/)(.+)$/)
    const value = match?.[2]?.replace(/^"|"$/g, '')
    if (match?.[1] && value) tokens.push(tokenOf(match[1], value))
    else words.push(word)
  }
  return { tokens, text: words.join(' ').trim() }
}

export function applyQuery(search: LogSearch, parsed: ParsedQuery): LogSearch {
  const next: LogSearch = { ...search, q: parsed.text || undefined }
  for (const token of parsed.tokens) {
    if (token.kind === 'service') next.service = token.value
    if (token.kind === 'trace') next.traceId = token.value
    if (token.kind === 'level') next.levels = [...new Set([...(next.levels ?? []), token.value])]
    if (token.kind === 'attr' && Object.keys(next.attrs ?? {}).length < MAX_ATTRS) {
      next.attrs = { ...next.attrs, [token.key]: token.value }
    }
  }
  return cleanLogSearch(next)
}

/** A starting name for "Save view": what the filters say, in a few words. */
export function suggestViewName(search: LogSearch): string {
  const parts = [
    search.service,
    search.levels?.join(' and '),
    search.q && `“${search.q}”`,
    ...Object.entries(search.attrs ?? {}).map(([key, value]) => `${key}=${value}`),
  ].filter(Boolean)
  return (parts.length ? parts.join(' · ') : 'All logs').slice(0, 80)
}

/** Toggles one level and keeps the list in severity order, so URLs for the same set match. */
export function toggleLevel(levels: TelemetryLevel[], value: string): TelemetryLevel[] {
  if (!isTelemetryLevel(value)) return levels
  const next = levels.includes(value)
    ? levels.filter((level) => level !== value)
    : [...levels, value]
  return TELEMETRY_LEVELS.filter((level) => next.includes(level)).reverse()
}

/** Applied filters as chips; each carries the patch that removes it. */
export function logChips(search: LogSearch): LogChip[] {
  const chips: LogChip[] = []
  if (search.service) {
    chips.push({
      key: 'service',
      label: 'service',
      value: search.service,
      without: { service: undefined },
    })
  }
  if (search.traceId) {
    chips.push({
      key: 'trace',
      label: 'trace',
      value: search.traceId,
      without: { traceId: undefined },
    })
  }
  for (const [key, value] of Object.entries(search.attrs ?? {})) {
    const { [key]: _removed, ...rest } = search.attrs ?? {}
    chips.push({ key: `attr:${key}`, label: key, value, without: { attrs: rest } })
  }
  return chips
}
