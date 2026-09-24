import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { recordTriage, triageQuery } from '@/integrations/studio-api'
import { whiskersIssuesQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import { triageKey, useTriageRecords } from '../../../shared/console-data'
import type { SectionDefinition, SectionTable } from '../../../shared/console-model'
import { useConsoleStore } from '../../../use-console-store'
import { formatSeconds, textCell as text } from '../utils'
import { REGRESSIONS_SECTION } from '../values'

/** An issue a human resolved in CodeWhiskers that has fired since. Nothing else counts. */
export function useRegressionsSection(): SectionDefinition {
  const queryClient = useQueryClient()
  const { data: issues } = useQuery({ ...whiskersIssuesQuery(), retry: false })
  const records = useTriageRecords()

  return useMemo(() => {
    const all = issues ?? []
    if (all.length === 0) return { ...REGRESSIONS_SECTION, sample: true }

    const regressions = all
      .map((issue) => {
        const scope = `project:${issue.projectId}`
        const ref = { scope, itemKind: 'issue' as const, itemRef: issue.id }
        const record = records.get(triageKey(ref))
        if (record?.status !== 'resolved' || issue.lastSeen <= record.updatedAt) return null
        return { issue, ref, resolvedAt: record.updatedAt, itemId: `${scope}/${issue.id}` }
      })
      .filter((r) => r !== null)
      .sort((a, b) => b.issue.lastSeen.getTime() - a.issue.lastSeen.getTime())
    const resolvedCount = [...records.values()].filter(
      (r) => r.itemKind === 'issue' && r.status === 'resolved',
    ).length

    const table: SectionTable = {
      grid: '1fr 110px 130px 130px 120px',
      columns: [
        { label: 'Issue' },
        { label: 'Project' },
        { label: 'Resolved' },
        { label: 'Back after' },
        { label: 'In release', align: 'end' },
      ],
      rows: regressions.map(({ issue, resolvedAt }) => [
        text(issue.title, { strong: true, dot: 'critical' }),
        text(issue.projectId, { mono: true, tone: 'muted' }),
        text(`${formatAge(resolvedAt)} ago`, { tone: 'muted' }),
        text(formatSeconds((issue.lastSeen.getTime() - resolvedAt.getTime()) / 1000), {
          mono: true,
          tone: 'bad',
        }),
        text(issue.lastRelease ?? '—', { mono: true, tone: 'muted', align: 'end' }),
      ]),
      rowLinks: regressions.map(({ itemId }) => ({ kind: 'triage' as const, itemId })),
      rowActions: regressions.map(({ issue, ref }) => [
        {
          label: 'Resolve again',
          onSelect: () => {
            recordTriage({ ...ref, status: 'resolved' })
              .then(() => queryClient.invalidateQueries({ queryKey: triageQuery().queryKey }))
              .then(() => useConsoleStore.getState().flash(`${issue.title} resolved again`))
              .catch((error: Error) => useConsoleStore.getState().flash(error.message))
          },
        },
      ]),
      footer:
        regressions.length === 0
          ? 'Nothing you resolved has come back'
          : 'Resolved in CodeWhiskers, then seen again · they are back in the triage inbox too',
    }

    return {
      title: 'Regressions',
      subtitle: `${regressions.length} of ${resolvedCount} resolved issues came back`,
      actions: [],
      stats: [
        { label: 'Regressed', value: String(regressions.length), note: 'back after resolving' },
        { label: 'Resolved', value: String(resolvedCount), note: 'by the team' },
        {
          label: 'Holding',
          value: resolvedCount
            ? `${Math.round(((resolvedCount - regressions.length) / resolvedCount) * 100)}%`
            : '—',
          note: 'stayed fixed',
        },
        {
          label: 'Fastest return',
          value: regressions.length
            ? formatSeconds(
                Math.min(
                  ...regressions.map(
                    (r) => (r.issue.lastSeen.getTime() - r.resolvedAt.getTime()) / 1000,
                  ),
                ),
              )
            : '—',
          note: 'resolve to next event',
        },
      ],
      tabs: ['Regressed'],
      table,
    }
  }, [issues, records, queryClient])
}
