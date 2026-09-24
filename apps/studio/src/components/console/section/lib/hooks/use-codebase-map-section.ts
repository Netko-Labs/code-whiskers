import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { type WhiskersHotspot, whiskersHotspotsQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type {
  ConsoleSeverity,
  SectionDefinition,
  SectionTable,
} from '../../../shared/console-model'
import { CODEBASE_MAP_SECTION } from '../values'

const TABS = ['All', 'Blocking'] as const
const GRID = '1fr 200px 170px 90px 90px 60px 100px'
const COLUMNS = [
  { label: 'Directory' },
  { label: 'Repository' },
  { label: 'Owners' },
  { label: 'Findings' },
  { label: 'Blocking' },
  { label: 'PRs' },
  { label: 'Last flagged', align: 'end' as const },
]

function blocking(spot: WhiskersHotspot): number {
  return spot.critical + spot.high
}

function dotFor(spot: WhiskersHotspot): ConsoleSeverity {
  if (blocking(spot) > 0) return 'critical'
  return spot.medium > 0 ? 'warning' : 'info'
}

/** Where findings land, by directory, from the latest review of each PR in the last 90 days. */
export function useCodebaseMapSection(tab: number): SectionDefinition {
  const { data } = useQuery({ ...whiskersHotspotsQuery(), retry: false })

  return useMemo(() => {
    const spots = data ?? []
    if (spots.length === 0) return { ...CODEBASE_MAP_SECTION, sample: true }

    const visible = tab === 1 ? spots.filter((s) => blocking(s) > 0) : spots
    const blockingTotal = spots.reduce((sum, s) => sum + blocking(s), 0)

    const table: SectionTable = {
      grid: GRID,
      columns: COLUMNS,
      rows: visible.map((spot) => [
        {
          kind: 'text' as const,
          text: spot.directory,
          mono: true,
          strong: true,
          dot: dotFor(spot),
        },
        { kind: 'text' as const, text: spot.repository, mono: true, tone: 'muted' as const },
        {
          kind: 'text' as const,
          text: spot.owners.length ? spot.owners.join(' ') : 'no owner',
          mono: true,
          tone: spot.owners.length ? undefined : ('faint' as const),
        },
        { kind: 'text' as const, text: String(spot.findings), mono: true },
        {
          kind: 'text' as const,
          text: String(blocking(spot)),
          mono: true,
          tone: blocking(spot) > 0 ? ('bad' as const) : ('muted' as const),
        },
        { kind: 'text' as const, text: String(spot.pullRequests), mono: true },
        {
          kind: 'text' as const,
          text: `${formatAge(spot.lastSeen)} ago`,
          tone: 'muted' as const,
          align: 'end' as const,
        },
      ]),
      rowLinks: visible.map((spot) => ({
        kind: 'external' as const,
        href: `https://github.com/${spot.repository}/tree/HEAD/${spot.directory === '.' ? '' : spot.directory}`,
      })),
      footer:
        'Latest review of each pull request, last 90 days · owners from each repository’s CODEOWNERS',
    }

    const repositories = new Set(spots.map((s) => s.repository)).size

    return {
      title: 'Codebase map',
      subtitle: `Where findings land across ${repositories} ${repositories === 1 ? 'repository' : 'repositories'}`,
      actions: [],
      stats: [
        { label: 'Directories', value: String(spots.length), note: 'with findings' },
        { label: 'Blocking', value: String(blockingTotal), note: 'high or critical' },
        {
          label: 'Unowned',
          value: String(spots.filter((s) => s.owners.length === 0).length),
          note: 'directories with no CODEOWNERS entry',
        },
        {
          label: 'Hottest',
          value: spots[0]?.directory ?? '—',
          note: spots[0]?.repository ?? '',
        },
      ],
      tabs: [...TABS],
      table,
    }
  }, [data, tab])
}
