import type { Tone } from '@/components/shared/status'
import type { MenuOption } from '@/components/shared/toolbar'
import type { WhiskersRelease } from '@/integrations/whiskers'
import type { SectionFilters } from '../../../shared/console-model'
import type { ReleaseFacets, ReleaseFilter } from './types'

/** `a,b` in the URL; empty means no facet applied. */
export function listOf(value: string | undefined): string[] {
  return value ? value.split(',').filter(Boolean) : []
}

/** Adds or removes one value; an emptied list leaves the URL. */
export function toggled(value: string | undefined, item: string): string | undefined {
  const list = listOf(value)
  const next = list.includes(item) ? list.filter((one) => one !== item) : [...list, item]
  return next.length ? next.join(',') : undefined
}

export function releaseFilterOf(tab: number, filters: SectionFilters): ReleaseFilter {
  return {
    projectIds: listOf(filters.project),
    environments: listOf(filters.environment),
    q: filters.q?.trim().toLowerCase() ?? '',
    hasNewIssuesOnly: tab === 1,
  }
}

export function filterReleases(
  releases: WhiskersRelease[],
  filter: ReleaseFilter,
): WhiskersRelease[] {
  return releases.filter(
    (release) =>
      (filter.projectIds.length === 0 || filter.projectIds.includes(release.projectId)) &&
      (filter.environments.length === 0 ||
        release.environments.some((env) => filter.environments.includes(env.name))) &&
      (!filter.q || release.release.toLowerCase().includes(filter.q)) &&
      (!filter.hasNewIssuesOnly || release.newIssues > 0),
  )
}

function countBy(values: string[], label: (value: string) => string): MenuOption[] {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts]
    .map(([value, count]) => ({ value, label: label(value), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export function facetsOf(
  releases: WhiskersRelease[],
  projectName: (projectId: string) => string,
): ReleaseFacets {
  return {
    projects: countBy(
      releases.map((release) => release.projectId),
      projectName,
    ),
    environments: countBy(
      releases.flatMap((release) => release.environments.map((env) => env.name)),
      (name) => name,
    ),
  }
}

/** Red when it brought new errors, amber for new warnings and the rest, quiet otherwise. */
export function newIssueTone(release: Pick<WhiskersRelease, 'newIssues' | 'newErrors'>): Tone {
  if (release.newErrors > 0) return 'error'
  return release.newIssues > 0 ? 'warning' : 'neutral'
}

export function optionLabel(options: MenuOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value
}
