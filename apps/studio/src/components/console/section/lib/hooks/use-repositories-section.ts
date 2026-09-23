import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { instanceQuery, repositoriesQuery } from '@/integrations/studio-api'
import { whiskersReviewsQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type { SectionDefinition, SectionTable } from '../../../shared/console-model'
import { REPOSITORIES_SECTION } from '../values'

const GRID = '1fr 130px 110px 130px 120px 100px'
const COLUMNS = [
  { label: 'Repository' },
  { label: 'Language' },
  { label: 'Reviews' },
  { label: 'Findings' },
  { label: 'Visibility' },
  { label: 'Last push', align: 'end' as const },
]

/**
 * Studio owns the repository list; whiskers owns the reviews. Joined here rather
 * than server-side because they are different databases on purpose.
 */
export function useRepositoriesSection(tab: number): SectionDefinition {
  const { data: repositories } = useQuery({ ...repositoriesQuery(), retry: false })
  const { data: reviews } = useQuery({ ...whiskersReviewsQuery(), retry: false })
  const { data: instance } = useQuery({ ...instanceQuery(), retry: false })

  return useMemo(() => {
    const repos = repositories ?? []
    if (repos.length === 0) return { ...REPOSITORIES_SECTION, sample: true }

    const bySlug = new Map<string, { reviews: number; findings: number }>()
    for (const review of reviews ?? []) {
      const slug = `${review.owner}/${review.repo}`.toLowerCase()
      const entry = bySlug.get(slug) ?? { reviews: 0, findings: 0 }
      entry.reviews += 1
      entry.findings += review.findingCount
      bySlug.set(slug, entry)
    }

    const visible =
      tab === 1
        ? repos.filter((r) => r.isWatched)
        : tab === 2
          ? repos.filter((r) => !r.isWatched)
          : repos
    const watched = repos.filter((r) => r.isWatched).length
    const reviewed = repos.filter((r) => bySlug.has(`${r.owner}/${r.name}`.toLowerCase())).length

    const table: SectionTable = {
      grid: GRID,
      columns: COLUMNS,
      rows: visible.map((repo) => {
        const stats = bySlug.get(`${repo.owner}/${repo.name}`.toLowerCase())
        return [
          {
            kind: 'text' as const,
            text: `${repo.owner}/${repo.name}`,
            mono: true,
            strong: true,
            dot: repo.isWatched ? ('ok' as const) : ('idle' as const),
          },
          { kind: 'text' as const, text: repo.language ?? '—', tone: 'muted' as const },
          { kind: 'text' as const, text: String(stats?.reviews ?? 0), mono: true },
          {
            kind: 'text' as const,
            text: String(stats?.findings ?? 0),
            mono: true,
            tone: (stats?.findings ?? 0) > 0 ? ('warn' as const) : ('muted' as const),
          },
          {
            kind: 'pill' as const,
            text: repo.isPrivate ? 'private' : 'public',
            tone: 'neutral' as const,
          },
          {
            kind: 'text' as const,
            text: repo.pushedAt ? formatAge(repo.pushedAt) : '—',
            tone: 'muted' as const,
            align: 'end' as const,
          },
        ]
      }),
      footer:
        'A repository is reviewed only while it is watched — unwatching keeps ingest, stops reviews',
    }

    return {
      title: 'Repositories',
      subtitle: `${repos.length} connected through the GitHub App`,
      actions: [
        {
          label: 'Add repositories',
          variant: 'solid',
          href: instance?.githubApp.installUrl,
        },
      ],
      stats: [
        { label: 'Connected', value: String(repos.length), note: 'via installations' },
        { label: 'Watched', value: String(watched), note: `${repos.length - watched} paused` },
        { label: 'Reviewed', value: String(reviewed), note: 'have at least one review' },
        {
          label: 'Private',
          value: String(repos.filter((r) => r.isPrivate).length),
          note: 'of the connected set',
        },
      ],
      tabs: ['All', 'Watched', 'Paused'],
      table,
    }
  }, [repositories, reviews, instance, tab])
}
