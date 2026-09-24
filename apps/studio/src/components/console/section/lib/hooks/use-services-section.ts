import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { type WhiskersService, whiskersServicesQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type { SectionDefinition, SectionTable } from '../../../shared/console-model'
import { textCell as text } from '../utils'
import { SERVICES_SECTION } from '../values'

function errorShare(service: WhiskersService): number {
  const total = service.logs + service.spans
  return total ? (service.logErrors + service.spanErrors) / total : 0
}

function ms(value: number | null): string {
  if (value === null) return '—'
  return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${Math.round(value)}ms`
}

/** Services are whatever named itself in `service.name` today, logs and spans together. */
export function useServicesSection(tab: number): SectionDefinition {
  const { data, isFetched } = useQuery({ ...whiskersServicesQuery(), retry: false })

  return useMemo(() => {
    const services = data ?? []
    if (isFetched && services.length === 0) return { ...SERVICES_SECTION, sample: true }
    const erroring = services.filter((s) => s.logErrors + s.spanErrors > 0)
    const visible = tab === 1 ? erroring : services
    const slowest = [...services].sort((a, b) => (b.p95Ms ?? 0) - (a.p95Ms ?? 0))[0]

    const table: SectionTable = {
      grid: '1fr 90px 90px 90px 110px 90px 90px 110px',
      columns: [
        { label: 'Service' },
        { label: 'Logs' },
        { label: 'Spans' },
        { label: 'Errors' },
        { label: 'Error share' },
        { label: 'p50' },
        { label: 'p95' },
        { label: 'Last seen', align: 'end' },
      ],
      rows: visible.map((service) => {
        const share = errorShare(service)
        return [
          text(service.service, {
            mono: true,
            strong: true,
            dot: share > 0.05 ? 'critical' : share > 0 ? 'warning' : 'ok',
          }),
          text(service.logs.toLocaleString(), { mono: true }),
          text(service.spans.toLocaleString(), { mono: true }),
          text(String(service.logErrors + service.spanErrors), {
            mono: true,
            tone: share ? 'bad' : 'muted',
          }),
          {
            kind: 'bar',
            percent: Math.max(1, Math.round(share * 100)),
            tone: share > 0.05 ? 'bad' : share ? 'warn' : 'ok',
            note: `${(share * 100).toFixed(1)}%`,
          },
          text(ms(service.p50Ms), { mono: true, tone: 'muted' }),
          text(ms(service.p95Ms), { mono: true }),
          text(service.lastSeen ? `${formatAge(service.lastSeen)} ago` : '—', {
            tone: 'muted',
            align: 'end',
          }),
        ]
      }),
      rowLinks: visible.map((service) => ({
        kind: 'section' as const,
        section: 'live-logs' as const,
        filters: { service: service.service },
      })),
      footer: 'Last 24 hours of logs and spans · open a service for its logs',
    }

    return {
      title: 'Services',
      subtitle: `${services.length} reporting today`,
      actions: [],
      stats: [
        { label: 'Services', value: String(services.length), note: 'reporting today' },
        { label: 'With errors', value: String(erroring.length), note: 'logs or spans' },
        { label: 'Slowest p95', value: ms(slowest?.p95Ms ?? null), note: slowest?.service ?? '' },
        {
          label: 'Busiest',
          value:
            [...services].sort((a, b) => b.logs + b.spans - (a.logs + a.spans))[0]?.service ?? '—',
          note: 'by volume',
        },
      ],
      tabs: ['All', 'With errors'],
      table,
    }
  }, [data, isFetched, tab])
}
