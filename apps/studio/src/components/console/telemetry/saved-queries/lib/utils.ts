import type { SavedQuery } from '@/integrations/studio-api'
import { parseLogSearch } from '../../logs-explorer'
import { rangeLabel } from '../../shared/telemetry-time'
import { parseTraceSearch } from '../../traces'
import type { SavedDestination } from './types'

function legacySearch(saved: SavedQuery): Record<string, unknown> {
  return { tab: saved.tab, q: saved.query ?? undefined, service: saved.service ?? undefined }
}

/**
 * Where a saved view opens. Views saved before `params` existed carry a tab, search and
 * service; the explorers' parsers read those the same way their URLs once did.
 */
export function destinationOf(saved: SavedQuery): SavedDestination {
  const source = Object.keys(saved.params).length ? saved.params : legacySearch(saved)
  if (saved.section === 'live-logs') return { section: 'live-logs', search: parseLogSearch(source) }
  if (saved.section === 'traces') return { section: 'traces', search: parseTraceSearch(source) }
  return {
    section: 'issues',
    search: {
      tab: saved.tab,
      q: saved.query ?? undefined,
      service: saved.service ?? undefined,
    },
  }
}

/** The view's filters in a line, the way they would be typed into the explorer. */
export function summaryOf(destination: SavedDestination): string {
  const parts: string[] = []
  const { search } = destination
  if (search.service) parts.push(`service:${search.service}`)
  if (destination.section === 'live-logs') {
    const logs = destination.search
    if (logs.levels?.length) parts.push(`level:${logs.levels.join(',')}`)
    if (logs.traceId) parts.push(`trace:${logs.traceId.slice(0, 8)}`)
    for (const [key, value] of Object.entries(logs.attrs ?? {})) parts.push(`${key}:${value}`)
    if (logs.q) parts.push(`“${logs.q}”`)
    parts.push(rangeLabel(logs, '1h').toLowerCase())
  } else if (destination.section === 'traces') {
    const traces = destination.search
    if (traces.errors) parts.push('with errors')
    if (traces.minMs) parts.push(`≥ ${traces.minMs}ms`)
    if (traces.q) parts.push(`“${traces.q}”`)
    if (traces.sort) parts.push('slowest first')
    parts.push(rangeLabel(traces, '24h').toLowerCase())
  } else if (destination.search.q) {
    parts.push(`“${destination.search.q}”`)
  }
  return parts.join(' · ')
}
