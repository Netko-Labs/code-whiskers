import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { organizationsQuery, rulesQuery } from '@/integrations/studio-api'
import type { ReviewRulesState } from '../types'
import { sortRules } from '../utils'

export function useReviewRules(): ReviewRulesState {
  const rules = useQuery({ ...rulesQuery(), retry: false })
  const organizations = useQuery({ ...organizationsQuery(), retry: false })

  const { data: ruleData, isError, refetch } = rules
  const { data: orgData } = organizations
  const isLoading = rules.isLoading || organizations.isLoading
  return useMemo(() => {
    const all = sortRules(ruleData ?? [])
    return {
      rules: all,
      organizations: orgData ?? [],
      counts: {
        all: all.length,
        active: all.filter((rule) => !rule.isMuted).length,
        muted: all.filter((rule) => rule.isMuted).length,
      },
      isLoading,
      isError,
      refetch: () => void refetch(),
    }
  }, [ruleData, orgData, isLoading, isError, refetch])
}
