import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { deleteSavedQuery, savedQueriesQuery } from '@/integrations/studio-api'
import { formatAge } from '@/shared/format-date'
import type { SectionDefinition, SectionTable } from '../../../shared/console-model'
import { useConsoleStore } from '../../../use-console-store'
import { textCell as text } from '../utils'

const SECTION_LABEL = { 'live-logs': 'Live logs', traces: 'Traces', issues: 'Issues' } as const
const TAB_LABEL: Record<string, string[]> = {
  'live-logs': ['All', 'Errors', 'Warnings'],
  traces: ['All', 'With errors', 'Slowest'],
  issues: ['Unresolved', 'Resolved', 'All'],
}

/** Saved from Live logs or Traces with "Save view"; opening one restores its URL. */
export function useSavedQueriesSection(): SectionDefinition {
  const queryClient = useQueryClient()
  const { data } = useQuery({ ...savedQueriesQuery(), retry: false })

  return useMemo(() => {
    const saved = data ?? []
    const table: SectionTable = {
      grid: '1fr 120px 120px 1fr 140px 100px',
      columns: [
        { label: 'Name' },
        { label: 'Section' },
        { label: 'Tab' },
        { label: 'Search' },
        { label: 'Service' },
        { label: 'Saved', align: 'end' },
      ],
      rows: saved.map((view) => [
        text(view.name, { strong: true }),
        text(SECTION_LABEL[view.section], { tone: 'muted' }),
        text(TAB_LABEL[view.section]?.[view.tab] ?? `Tab ${view.tab + 1}`, { tone: 'muted' }),
        text(view.query ?? '—', { mono: true, tone: view.query ? undefined : 'faint' }),
        text(view.service ?? 'any', { mono: true, tone: 'muted' }),
        text(`${formatAge(view.createdAt)} ago`, { tone: 'muted', align: 'end' }),
      ]),
      rowLinks: saved.map((view) => ({
        kind: 'section' as const,
        section: view.section,
        tab: view.tab,
        filters: { q: view.query ?? undefined, service: view.service ?? undefined },
      })),
      rowActions: saved.map((view) => [
        {
          label: 'Delete',
          tone: 'danger' as const,
          onSelect: () => {
            deleteSavedQuery(view.id)
              .then(() => queryClient.invalidateQueries({ queryKey: savedQueriesQuery().queryKey }))
              .then(() => useConsoleStore.getState().flash(`${view.name} deleted`))
              .catch((error: Error) => useConsoleStore.getState().flash(error.message))
          },
        },
      ]),
      footer: saved.length
        ? 'Open a row to land on that view with its filters'
        : 'Nothing saved yet — use "Save view" on Live logs or Traces',
    }

    return {
      title: 'Saved queries',
      subtitle: 'Views you come back to, one click away',
      actions: [{ label: 'Open live logs', variant: 'outline', href: '/console/live-logs' }],
      stats: [
        { label: 'Saved', value: String(saved.length), note: 'yours' },
        {
          label: 'Logs',
          value: String(saved.filter((v) => v.section === 'live-logs').length),
          note: 'views',
        },
        {
          label: 'Traces',
          value: String(saved.filter((v) => v.section === 'traces').length),
          note: 'views',
        },
        {
          label: 'Newest',
          value: saved[0]?.name ?? '—',
          note: saved[0] ? `${formatAge(saved[0].createdAt)} ago` : '',
        },
      ],
      tabs: ['All'],
      table,
    }
  }, [data, queryClient])
}
