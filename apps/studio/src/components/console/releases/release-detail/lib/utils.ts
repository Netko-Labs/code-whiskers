import type { WhiskersDeployEntry } from '@/integrations/whiskers'
import { searchText } from '../../../shared/console-routing'
import type { DeployGroup, ReleaseSearch, ReleaseSearchInput } from './types'
import { RELEASE_TABS } from './values'

export function parseReleaseSearch(search: ReleaseSearchInput): ReleaseSearch {
  const project = searchText(search.project) ?? ''
  return {
    project,
    tab: RELEASE_TABS.find((tab) => tab === search.tab) ?? 'overview',
  }
}

/**
 * Deploys grouped by environment, newest first in each; environments this release reached lead,
 * then by their latest deploy.
 */
export function deployGroupsOf(deploys: WhiskersDeployEntry[]): DeployGroup[] {
  const groups = new Map<string, WhiskersDeployEntry[]>()
  for (const deploy of deploys) {
    groups.set(deploy.environment, [...(groups.get(deploy.environment) ?? []), deploy])
  }
  const latest = (group: DeployGroup) => group.deploys[0]?.deployedAt.getTime() ?? 0
  const hasThis = (group: DeployGroup) => group.deploys.some((deploy) => deploy.isThisRelease)
  return [...groups]
    .map(([environment, list]) => ({
      environment,
      deploys: [...list].sort((a, b) => b.deployedAt.getTime() - a.deployedAt.getTime()),
    }))
    .sort((a, b) => Number(hasThis(b)) - Number(hasThis(a)) || latest(b) - latest(a))
}

/** Daily bucket label for the 14-day chart: `Oct 5`. */
export function dayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}
