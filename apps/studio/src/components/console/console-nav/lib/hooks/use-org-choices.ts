import { useQuery } from '@tanstack/react-query'
import { instanceQuery } from '@/integrations/studio-api'
import { useOrganizations } from '../../../shared/console-data'
import { useConsoleStore } from '../../../use-console-store'
import type { OrgChoices } from '../types'
import { ALL_ORGANIZATIONS } from '../values'

/** "All" only earns a row when there is more than one installation to choose between. */
export function useOrgChoices(): OrgChoices {
  const orgLogin = useConsoleStore((s) => s.orgLogin)
  const { orgs, sample } = useOrganizations()
  const { data: instance } = useQuery({ ...instanceQuery(), retry: false })
  const selected = orgs.find((org) => org.login === orgLogin) ?? ALL_ORGANIZATIONS
  return {
    choices: orgs.length > 1 ? [ALL_ORGANIZATIONS, ...orgs] : orgs,
    selected,
    shown: orgs.length === 1 ? orgs[0] : selected,
    sample,
    installUrl: instance?.githubApp.installUrl ?? null,
  }
}
