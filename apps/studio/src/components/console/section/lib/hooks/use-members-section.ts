import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { instanceQuery } from '@/integrations/studio-api'
import { formatAge } from '@/shared/format-date'
import { useMembers, useTriageRecords, useViewer } from '../../../shared/console-data'
import type { SectionDefinition, SectionTable } from '../../../shared/console-model'
import { MEMBERS_SECTION } from '../values'

const GRID = '1fr 1fr 140px 120px'
const COLUMNS = [
  { label: 'Member' },
  { label: 'Organizations' },
  { label: 'Assigned, open' },
  { label: 'Last synced', align: 'end' as const },
]
const CLOSED = new Set(['resolved', 'approved', 'dismissed', 'tracked'])

/**
 * Access follows the GitHub App: whoever signs in with GitHub and belongs to an installation is a
 * member. There is nothing to invite here; there is only who has shown up.
 */
export function useMembersSection(): SectionDefinition {
  const members = useMembers()
  const records = useTriageRecords()
  const viewer = useViewer()
  const { data: instance } = useQuery({ ...instanceQuery(), retry: false })

  return useMemo(() => {
    if (members.length === 0) return { ...MEMBERS_SECTION, sample: true }

    const open = new Map<string, number>()
    for (const record of records.values()) {
      if (!record.assigneeUserId || CLOSED.has(record.status)) continue
      open.set(record.assigneeUserId, (open.get(record.assigneeUserId) ?? 0) + 1)
    }
    const organizations = new Set(members.flatMap((m) => m.organizations))

    const table: SectionTable = {
      grid: GRID,
      columns: COLUMNS,
      rows: members.map((member) => [
        {
          kind: 'text' as const,
          text: member.id === viewer?.id ? `${member.name} (you)` : member.name,
          strong: true,
        },
        {
          kind: 'text' as const,
          text: member.organizations.join(', '),
          mono: true,
          tone: 'muted' as const,
        },
        { kind: 'text' as const, text: String(open.get(member.id) ?? 0), mono: true },
        {
          kind: 'text' as const,
          text: `${formatAge(member.lastSyncedAt)} ago`,
          tone: 'muted' as const,
          align: 'end' as const,
        },
      ]),
      footer:
        'Teammates appear after they sign in with GitHub · access follows the App installation',
    }

    return {
      title: 'Members',
      subtitle: `${members.length} signed in across ${organizations.size} installation${organizations.size === 1 ? '' : 's'}`,
      actions: [
        {
          label: 'Install on another account',
          variant: 'outline',
          href: instance?.githubApp.installUrl,
        },
      ],
      stats: [
        { label: 'Members', value: String(members.length), note: 'have signed in' },
        { label: 'Installations', value: String(organizations.size), note: 'shared with you' },
        {
          label: 'Assigned, open',
          value: String([...open.values()].reduce((sum, n) => sum + n, 0)),
          note: 'across everyone',
        },
        { label: 'Yours', value: String(open.get(viewer?.id ?? '') ?? 0), note: 'assigned to you' },
      ],
      tabs: ['Members'],
      table,
    }
  }, [members, records, viewer, instance])
}
