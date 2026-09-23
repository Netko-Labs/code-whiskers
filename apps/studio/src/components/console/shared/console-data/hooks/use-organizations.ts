import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { organizationsQuery, syncGithub } from '@/integrations/studio-api'
import type { ConsoleOrg } from '../../console-model'
import { ORGS } from '../values'

const TINTS = ['#e4e4e7', '#a3e635', '#93c5fd', '#fca5a5', '#fcd34d']

function toConsoleOrg(
  org: { login: string; name: string | null; accountType: string },
  index: number,
): ConsoleOrg {
  return {
    login: org.login,
    isOrganization: org.accountType === 'Organization',
    name: org.name ?? org.login,
    meta: org.accountType === 'Organization' ? 'Organization' : 'Personal',
    mono: org.login.slice(0, 2).toUpperCase(),
    tint: TINTS[index % TINTS.length] ?? '#e4e4e7',
  }
}

export type OrganizationsResult = {
  orgs: ConsoleOrg[]
  sample: boolean
}

/**
 * Real installations once the sync has run; the sample set until then, so a
 * fresh instance never shows an empty switcher.
 */
export function useOrganizations(): OrganizationsResult {
  const { data } = useQuery({ ...organizationsQuery(), retry: false })
  const orgs = (data ?? []).map(toConsoleOrg)
  return orgs.length > 0 ? { orgs, sample: false } : { orgs: ORGS, sample: true }
}

/** Pulls installations from GitHub once per console session. */
export function useGithubSync(): void {
  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: syncGithub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio'] })
    },
  })

  useEffect(() => {
    mutate()
  }, [mutate])
}
