import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { savedQueriesQuery } from '@/integrations/studio-api'
import { whiskersLogsQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type {
  PillTone,
  SectionDefinition,
  SectionFilters,
  SectionTable,
} from '../../../shared/console-model'
import { saveViewAction, textCell as text } from '../utils'
import { LIVE_LOGS_SECTION } from '../values'

const LEVELS = [undefined, 'error', 'warn'] as const
const LEVEL_TONE: Record<string, PillTone> = {
  FATAL: 'bad',
  ERROR: 'bad',
  WARN: 'warn',
  INFO: 'neutral',
}

function clock(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false,
  })
}

/** Newest lines first, refreshed every few seconds; the URL carries the search and service. */
export function useLiveLogsSection(tab: number, filters: SectionFilters): SectionDefinition {
  const queryClient = useQueryClient()
  const level = LEVELS[tab] ?? undefined
  const { data, isFetched } = useQuery({
    ...whiskersLogsQuery({ service: filters.service, level, q: filters.q }),
    retry: false,
  })

  return useMemo(() => {
    const lines = data ?? []
    const isFiltered = !!(filters.q || filters.service || level)
    if (isFetched && lines.length === 0 && !isFiltered) {
      return { ...LIVE_LOGS_SECTION, sample: true }
    }
    const origin = typeof window === 'undefined' ? '' : window.location.origin
    const services = new Set(lines.map((l) => l.service))

    const table: SectionTable = {
      grid: '110px 80px 150px 1fr',
      columns: [{ label: 'Time' }, { label: 'Level' }, { label: 'Service' }, { label: 'Message' }],
      rows: lines.map((line) => [
        text(clock(line.timestamp), { mono: true, tone: 'muted' }),
        { kind: 'pill', text: line.level.toLowerCase(), tone: LEVEL_TONE[line.level] ?? 'neutral' },
        text(line.service, { mono: true, tone: 'muted' }),
        text(line.message, {
          mono: true,
          wrap: true,
          tone: LEVEL_TONE[line.level] === 'bad' ? 'bad' : undefined,
        }),
      ]),
      rowLinks: lines.map((line) =>
        line.traceId
          ? { kind: 'section' as const, section: 'traces' as const, filters: { q: line.traceId } }
          : {
              kind: 'section' as const,
              section: 'live-logs' as const,
              tab,
              filters: { ...filters, service: line.service },
            },
      ),
      footer: `Refreshes every 5s · send OTLP/HTTP JSON to ${origin}/otlp with Authorization: Bearer <project key>`,
    }

    return {
      title: 'Live logs',
      subtitle: filters.service
        ? `Lines from ${filters.service}, newest first`
        : 'Every service, newest first',
      actions: [
        saveViewAction('live-logs', tab, filters, () =>
          queryClient.invalidateQueries({ queryKey: savedQueriesQuery().queryKey }),
        ),
      ],
      searchPlaceholder: 'Search messages…',
      stats: [
        {
          label: 'Lines',
          value: String(lines.length),
          note: lines.length === 200 ? 'newest 200' : 'matching',
        },
        {
          label: 'Errors',
          value: String(lines.filter((l) => LEVEL_TONE[l.level] === 'bad').length),
          note: 'in view',
        },
        { label: 'Services', value: String(services.size), note: 'in view' },
        {
          label: 'Newest',
          value: lines[0] ? `${formatAge(lines[0].timestamp)} ago` : '—',
          note: 'last line',
        },
      ],
      tabs: ['All', 'Errors', 'Warnings'],
      table,
    }
  }, [data, isFetched, filters, level, tab, queryClient])
}
