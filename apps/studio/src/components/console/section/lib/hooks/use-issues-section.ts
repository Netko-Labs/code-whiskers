import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { savedQueriesQuery } from '@/integrations/studio-api'
import { whiskersIssuesQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import { triageKey, useMembers, useTriageRecords } from '../../../shared/console-data'
import type { SectionDefinition, SectionFilters, SectionTable } from '../../../shared/console-model'
import { issueDot, saveViewAction } from '../utils'
import { ISSUES_SECTION } from '../values'

const TABS = ['Unresolved', 'Resolved', 'All'] as const
const GRID = '1fr 150px 90px 100px 140px 90px'
const COLUMNS = [
  { label: 'Issue' },
  { label: 'Project' },
  { label: 'Level' },
  { label: 'Events' },
  { label: 'Assignee' },
  { label: 'Last seen', align: 'end' as const },
]

/** Whiskers groups the events; studio knows who resolved or owns each group. */
export function useIssuesSection(tab: number, filters: SectionFilters): SectionDefinition {
  const queryClient = useQueryClient()
  const { data } = useQuery({ ...whiskersIssuesQuery(), retry: false })
  const records = useTriageRecords()
  const members = useMembers()

  return useMemo(() => {
    const issues = data ?? []
    if (issues.length === 0) return { ...ISSUES_SECTION, sample: true }

    const rows = issues
      .map((issue) => {
        const scope = `project:${issue.projectId}`
        const record = records.get(triageKey({ scope, itemKind: 'issue', itemRef: issue.id }))
        const isResolved = issue.status === 'resolved' || record?.status === 'resolved'
        const assignee = members.find((m) => m.id === record?.assigneeUserId)?.name
        return { issue, isResolved, assignee, itemId: `${scope}/${issue.id}` }
      })
      .sort((a, b) => b.issue.lastSeen.getTime() - a.issue.lastSeen.getTime())
    const unresolved = rows.filter((r) => !r.isResolved)
    const needle = filters.q?.toLowerCase()
    const byTab = tab === 0 ? unresolved : tab === 1 ? rows.filter((r) => r.isResolved) : rows
    const visible = needle
      ? byTab.filter(({ issue }) =>
          `${issue.title} ${issue.projectId} ${issue.lastRelease ?? ''}`
            .toLowerCase()
            .includes(needle),
        )
      : byTab

    const table: SectionTable = {
      grid: GRID,
      columns: COLUMNS,
      rows: visible.map(({ issue, isResolved, assignee }) => [
        {
          kind: 'text' as const,
          text: issue.title,
          strong: true,
          dot: isResolved ? ('ok' as const) : issueDot(issue.level),
        },
        { kind: 'text' as const, text: issue.projectId, mono: true, tone: 'muted' as const },
        { kind: 'text' as const, text: issue.level, tone: 'muted' as const },
        { kind: 'text' as const, text: issue.eventCount.toLocaleString(), mono: true },
        { kind: 'text' as const, text: assignee ?? 'Unassigned', tone: 'muted' as const },
        {
          kind: 'text' as const,
          text: `${formatAge(issue.lastSeen)} ago`,
          tone: 'muted' as const,
          align: 'end' as const,
        },
      ]),
      rowLinks: visible.map(({ itemId }) => ({ kind: 'triage' as const, itemId })),
      footer: 'One row per stack shape · resolve, snooze or assign from triage',
    }

    return {
      title: 'Issues',
      subtitle: `${unresolved.length} unresolved · grouped by fingerprint`,
      actions: [
        saveViewAction('issues', tab, filters, () =>
          queryClient.invalidateQueries({ queryKey: savedQueriesQuery().queryKey }),
        ),
        { label: 'Open triage', variant: 'solid', href: '/console/triage/inbox' },
      ],
      stats: [
        { label: 'Unresolved', value: String(unresolved.length), note: 'open groups' },
        {
          label: 'Events',
          value: unresolved.reduce((sum, r) => sum + r.issue.eventCount, 0).toLocaleString(),
          note: 'across unresolved',
        },
        {
          label: 'Projects',
          value: String(new Set(issues.map((i) => i.projectId)).size),
          note: 'sending events',
        },
        {
          label: 'Resolved',
          value: String(rows.length - unresolved.length),
          note: 'kept for history',
        },
      ],
      tabs: [...TABS],
      searchPlaceholder: 'Title, project or release…',
      table,
    }
  }, [data, records, members, tab, filters, queryClient])
}
