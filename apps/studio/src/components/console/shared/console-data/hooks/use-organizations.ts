import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { organizationsQuery, syncGithub } from '@/integrations/studio-api'
import type { ConsoleOrg } from '../../console-model'

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
  isLoading: boolean
}

/** Installations once the GitHub sync has run; empty until the App is installed somewhere. */
export function useOrganizations(): OrganizationsResult {
  const { data, isLoading } = useQuery({ ...organizationsQuery(), retry: false })
  return { orgs: (data ?? []).map(toConsoleOrg), isLoading }
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
