import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { whiskersProjectsQuery, whiskersReleasesQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type { SectionDefinition, SectionFilters, SectionTable } from '../../../shared/console-model'
import { type ConsoleScope, isInScope } from '../../../shared/console-scope'
import { textCell as text } from '../utils'
import { RELEASES_SECTION } from '../values'

/** Releases are what SDKs report in `release`; what each one brought is read off the events. */
export function useReleasesSection(
  tab: number,
  _filters: SectionFilters,
  scope: ConsoleScope,
): SectionDefinition {
  const { data } = useQuery({ ...whiskersReleasesQuery(), retry: false })
  const { data: projects } = useQuery({ ...whiskersProjectsQuery(), retry: false })

  return useMemo(() => {
    if (!data?.length) return { ...RELEASES_SECTION, sample: true }
    const releases = data.filter((release) => isInScope(scope, { projectId: release.projectId }))

    const projectName = new Map((projects ?? []).map((p) => [p.id, p.name]))
    const visible = tab === 1 ? releases.filter((r) => r.newIssues > 0) : releases
    const latest = releases[0]

    const table: SectionTable = {
      grid: '1fr 150px 120px 90px 90px 110px 100px',
      columns: [
        { label: 'Release' },
        { label: 'Project' },
        { label: 'Environment' },
        { label: 'Events' },
        { label: 'Issues' },
        { label: 'New issues' },
        { label: 'First seen', align: 'end' },
      ],
      rows: visible.map((release) => [
        text(release.release, {
          mono: true,
          strong: true,
          dot: release.newIssues > 0 ? 'critical' : 'ok',
        }),
        text(projectName.get(release.projectId) ?? release.projectId, { tone: 'muted' }),
        text(release.environment ?? '—', { tone: 'muted' }),
        text(release.events.toLocaleString(), { mono: true }),
        text(String(release.issues), { mono: true }),
        text(String(release.newIssues), {
          mono: true,
          tone: release.newIssues > 0 ? 'bad' : 'muted',
        }),
        text(`${formatAge(release.firstSeen)} ago`, { tone: 'muted', align: 'end' }),
      ]),
      footer: 'Set release in Sentry.init — an issue is new in the release of its first event',
    }

    return {
      title: 'Releases',
      isScoped: true,
      subtitle: 'What each release brought in, read from the events that carry it',
      actions: [],
      stats: [
        { label: 'Releases', value: String(releases.length), note: 'reported by SDKs' },
        {
          label: 'Latest',
          value: latest?.release ?? '—',
          note: latest ? `${formatAge(latest.firstSeen)} ago` : '',
        },
        {
          label: 'New in latest',
          value: String(latest?.newIssues ?? 0),
          note: 'issues it introduced',
        },
        {
          label: 'With new issues',
          value: String(releases.filter((r) => r.newIssues > 0).length),
          note: 'of all releases',
        },
      ],
      tabs: ['All', 'Introduced issues'],
      table,
    }
  }, [data, projects, tab, scope])
}
