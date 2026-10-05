import type { SyncResult } from '@/integrations/studio-api'
import type { InstallationSummary, SummaryInput } from './types'

export function syncMessage(result: SyncResult): string {
  if (result.skipped) return 'No GitHub account is linked to this sign-in'
  const installations = `${result.organizations} installation${result.organizations === 1 ? '' : 's'}`
  const repositories = `${result.repositories} ${result.repositories === 1 ? 'repository' : 'repositories'}`
  return `Synced ${installations}, ${repositories}`
}

/** Repositories per installation, and how many of them the reviewer is watching. */
export function summarizeInstallations({ orgs, repos }: SummaryInput): InstallationSummary[] {
  return orgs.map((org) => {
    const mine = repos.filter((repo) => repo.installationId === org.installationId)
    return {
      org,
      repositories: mine.length,
      watched: mine.filter((repo) => repo.isWatched).length,
    }
  })
}

/** The freshest installation sync; the sync runs on every console session. */
export function latestSync(orgs: SummaryInput['orgs']): Date | null {
  return orgs.reduce<Date | null>(
    (latest, org) => (!latest || org.syncedAt > latest ? org.syncedAt : latest),
    null,
  )
}
