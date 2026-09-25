import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { savedQueriesQuery } from '@/integrations/studio-api'
import { whiskersIssuesQuery, whiskersProjectsQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import { triageKey, useMembers, useTriageRecords } from '../../../shared/console-data'
import type { SectionDefinition, SectionFilters, SectionTable } from '../../../shared/console-model'
import { type ConsoleScope, isInScope } from '../../../shared/console-scope'
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
export function useIssuesSection(
  tab: number,
  filters: SectionFilters,
  scope: ConsoleScope,
): SectionDefinition {
  const queryClient = useQueryClient()
  const { data } = useQuery({ ...whiskersIssuesQuery(), retry: false })
  const { data: projects } = useQuery({ ...whiskersProjectsQuery(), retry: false })
  const records = useTriageRecords()
  const members = useMembers()

  return useMemo(() => {
    const issues = data ?? []
    if (issues.length === 0) return { ...ISSUES_SECTION, sample: true }

    const projectName = new Map((projects ?? []).map((p) => [p.id, p.name]))
    const rows = issues
      .filter((issue) => isInScope(scope, { projectId: issue.projectId }))
      .map((issue) => {
        const ref = `project:${issue.projectId}`
        const record = records.get(triageKey({ scope: ref, itemKind: 'issue', itemRef: issue.id }))
        const isResolved = issue.status === 'resolved' || record?.status === 'resolved'
        const assignee = members.find((m) => m.id === record?.assigneeUserId)?.name
        const project = projectName.get(issue.projectId) ?? issue.projectId
        return { issue, project, isResolved, assignee, itemId: `${ref}/${issue.id}` }
      })
      .sort((a, b) => b.issue.lastSeen.getTime() - a.issue.lastSeen.getTime())
    const unresolved = rows.filter((r) => !r.isResolved)
    const needle = filters.q?.toLowerCase()
    const byTab = tab === 0 ? unresolved : tab === 1 ? rows.filter((r) => r.isResolved) : rows
    const visible = needle
      ? byTab.filter(({ issue, project }) =>
          `${issue.title} ${project} ${issue.lastRelease ?? ''}`.toLowerCase().includes(needle),
        )
      : byTab

    const table: SectionTable = {
      grid: GRID,
      columns: COLUMNS,
      rows: visible.map(({ issue, project, isResolved, assignee }) => [
        {
          kind: 'text' as const,
          text: issue.title,
          strong: true,
          dot: isResolved ? ('ok' as const) : issueDot(issue.level),
        },
        { kind: 'text' as const, text: project, mono: true, tone: 'muted' as const },
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
      isScoped: true,
      subtitle: `${unresolved.length} unresolved · grouped by fingerprint`,
      actions: [
        saveViewAction('issues', tab, filters, () =>
          queryClient.invalidateQueries({ queryKey: savedQueriesQuery().queryKey }),
        ),
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
          value: String(new Set(rows.map((r) => r.issue.projectId)).size),
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
  }, [data, projects, records, members, tab, filters, scope, queryClient])
}
