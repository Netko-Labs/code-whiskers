import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { savedQueriesQuery } from '@/integrations/studio-api'
import { whiskersTraceQuery, whiskersTracesQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type { SectionDefinition, SectionFilters, SectionTable } from '../../../shared/console-model'
import type { ConsoleScope } from '../../../shared/console-scope'
import { saveViewAction, textCell as text, unlinkedScopeNote } from '../utils'
import { TRACES_SECTION } from '../values'

function ms(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${Math.round(value)}ms`
}

/**
 * The last day of traces, one row each. Searching an exact trace id turns the table into that
 * trace's waterfall — the span list, offset from the root.
 */
export function useTracesSection(
  tab: number,
  filters: SectionFilters,
  scope: ConsoleScope,
): SectionDefinition {
  const queryClient = useQueryClient()
  const { data, isFetched } = useQuery({
    ...whiskersTracesQuery(filters.service, scope.projectIds),
    retry: false,
  })
  const traceId = filters.q?.trim()
  const { data: spans } = useQuery({
    ...whiskersTraceQuery(traceId ?? ''),
    enabled: !!traceId && (data ?? []).some((t) => t.traceId === traceId),
    retry: false,
  })

  return useMemo(() => {
    const traces = data ?? []
    if (isFetched && traces.length === 0 && !filters.service && !scope.value)
      return { ...TRACES_SECTION, sample: true }

    const needle = filters.q?.toLowerCase() ?? ''
    const matching = needle
      ? traces.filter(
          (t) => t.traceId.includes(needle) || t.rootName.toLowerCase().includes(needle),
        )
      : traces
    const visible =
      tab === 1
        ? matching.filter((t) => t.errors > 0)
        : tab === 2
          ? [...matching].sort((a, b) => b.durationMs - a.durationMs)
          : matching
    const slowest = Math.max(1, ...visible.map((t) => t.durationMs))
    const sorted = [...traces].sort((a, b) => a.durationMs - b.durationMs)
    const p95 = sorted[Math.floor(sorted.length * 0.95)]?.durationMs ?? 0

    const list: SectionTable = {
      grid: '1fr 150px 1fr 70px 70px 100px',
      columns: [
        { label: 'Operation' },
        { label: 'Service' },
        { label: 'Duration' },
        { label: 'Spans' },
        { label: 'Errors' },
        { label: 'Started', align: 'end' },
      ],
      rows: visible.map((trace) => [
        text(trace.rootName, { strong: true, dot: trace.errors > 0 ? 'critical' : undefined }),
        text(trace.rootService, { mono: true, tone: 'muted' }),
        {
          kind: 'bar',
          percent: Math.max(2, Math.round((trace.durationMs / slowest) * 100)),
          tone: trace.errors > 0 ? 'bad' : trace.durationMs >= p95 ? 'warn' : 'ok',
          note: ms(trace.durationMs),
        },
        text(String(trace.spans), { mono: true }),
        text(String(trace.errors), { mono: true, tone: trace.errors ? 'bad' : 'muted' }),
        text(`${formatAge(trace.startedAt)} ago`, { tone: 'muted', align: 'end' }),
      ]),
      rowLinks: visible.map((trace) => ({
        kind: 'section' as const,
        section: 'traces' as const,
        filters: { ...filters, q: trace.traceId },
      })),
      footer: 'Last 24 hours · open a row for its span waterfall',
    }

    const trace = traces.find((t) => t.traceId === traceId)
    const waterfall: SectionTable | null =
      trace && spans
        ? {
            grid: '1fr 150px 1.4fr 90px',
            columns: [
              { label: 'Span' },
              { label: 'Service' },
              { label: 'Timeline' },
              { label: 'Status', align: 'end' },
            ],
            rows: spans.map((span) => {
              const offset = span.startTime.getTime() - trace.startedAt.getTime()
              return [
                text(`${span.parentSpanId ? '↳ ' : ''}${span.name}`, {
                  mono: true,
                  strong: !span.parentSpanId,
                }),
                text(span.service, { mono: true, tone: 'muted' }),
                {
                  kind: 'bar',
                  percent: Math.max(
                    2,
                    Math.round((span.durationMs / Math.max(1, trace.durationMs)) * 100),
                  ),
                  tone: span.status === 'error' ? 'bad' : 'ok',
                  note: `+${ms(offset)} · ${ms(span.durationMs)}`,
                },
                {
                  kind: 'pill',
                  text: span.status,
                  tone: span.status === 'error' ? 'bad' : 'neutral',
                  align: 'end',
                },
              ]
            }),
            footer: `Trace ${trace.traceId} · ${spans.length} spans · clear the search to go back`,
          }
        : null

    return {
      title: waterfall ? (trace?.rootName ?? 'Trace') : 'Traces',
      isScoped: true,
      subtitle: waterfall
        ? `${ms(trace?.durationMs ?? 0)} across ${spans?.length ?? 0} spans`
        : (unlinkedScopeNote(scope) ?? 'Every trace from the last day'),
      actions: [
        saveViewAction('traces', tab, filters, () =>
          queryClient.invalidateQueries({ queryKey: savedQueriesQuery().queryKey }),
        ),
      ],
      searchPlaceholder: 'Operation or trace id…',
      stats: [
        { label: 'Traces', value: String(traces.length), note: 'last 24h' },
        {
          label: 'With errors',
          value: String(traces.filter((t) => t.errors > 0).length),
          note: 'any failed span',
        },
        { label: 'p95', value: ms(p95), note: 'root duration' },
        {
          label: 'Slowest',
          value: ms(sorted.at(-1)?.durationMs ?? 0),
          note: sorted.at(-1)?.rootName ?? '',
        },
      ],
      tabs: ['All', 'With errors', 'Slowest'],
      table: waterfall ?? list,
    }
  }, [data, isFetched, spans, filters, traceId, tab, scope, queryClient])
}
