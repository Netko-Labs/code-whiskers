import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { instanceQuery, membersQuery, organizationsQuery } from '@/integrations/studio-api'
import { useViewer } from '../../../../shared/console-data'
import type { MemberDirectory } from '../types'
import { sortMembers } from '../utils'

/** Members, the installations that grant them access, and where to grant more. */
export function useMemberDirectory(): MemberDirectory {
  const members = useQuery({ ...membersQuery(), retry: false })
  const orgs = useQuery({ ...organizationsQuery(), retry: false })
  const { data: instance } = useQuery({ ...instanceQuery(), retry: false })
  const viewer = useViewer()

  return useMemo(
    () => ({
      members: sortMembers(members.data ?? [], viewer?.id),
      installations: orgs.data ?? [],
      viewerId: viewer?.id,
      installUrl: instance?.githubApp.installUrl,
      isLoading: members.isPending,
      isError: members.isError,
      retry: () => void members.refetch(),
    }),
    [members, orgs.data, instance, viewer],
  )
}
