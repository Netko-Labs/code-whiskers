import { pairKey } from '../../releases'
import type { DeployEntry, DeploySummary, ReleaseEnvironment } from './types'

/**
 * Every environment a release reached, by events or by deploy, each with its newest deploy and
 * whether the release is what that environment runs now. Current ones first.
 */
export function releaseEnvironmentsOf(
  release: { id: string; projectId: string },
  eventEnvironments: string[],
  deploys: DeploySummary[],
  currents: Map<string, string>,
): ReleaseEnvironment[] {
  const deployedAt = new Map<string, Date>()
  for (const deploy of deploys) {
    const seen = deployedAt.get(deploy.environment)
    if (!seen || deploy.deployedAt > seen) deployedAt.set(deploy.environment, deploy.deployedAt)
  }
  const names = [...new Set([...deployedAt.keys(), ...eventEnvironments])]
  return names
    .map((name) => ({
      name,
      isCurrent: currents.get(pairKey(release.projectId, name)) === release.id,
      deployedAt: deployedAt.get(name) ?? null,
    }))
    .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent) || a.name.localeCompare(b.name))
}

/** Newest first; the first deploy seen per environment is the active one. */
export function deployTimelineOf(
  deploys: (DeploySummary & { version: string })[],
  releaseId: string,
): DeployEntry[] {
  const seen = new Set<string>()
  return [...deploys]
    .sort((a, b) => b.deployedAt.getTime() - a.deployedAt.getTime())
    .map((deploy) => {
      const isActive = !seen.has(deploy.environment)
      seen.add(deploy.environment)
      return { ...deploy, isActive, isThisRelease: deploy.releaseId === releaseId }
    })
}
