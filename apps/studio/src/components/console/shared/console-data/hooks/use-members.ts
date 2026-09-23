import { useQuery } from '@tanstack/react-query'
import { type Member, membersQuery } from '@/integrations/studio-api'

export function useMembers(): Member[] {
  return useQuery({ ...membersQuery(), retry: false }).data ?? []
}
