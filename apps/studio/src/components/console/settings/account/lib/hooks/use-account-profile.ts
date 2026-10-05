import { useQuery } from '@tanstack/react-query'
import { membersQuery } from '@/integrations/studio-api'
import { useViewer } from '../../../../shared/console-data'
import type { AccountProfile } from '../types'

/** The session knows name and avatar; the GitHub handle comes with the members list. */
export function useAccountProfile(): AccountProfile {
  const viewer = useViewer()
  const { data: members } = useQuery({ ...membersQuery(), retry: false })
  const self = members?.find((member) => member.id === viewer?.id)
  return { viewer, githubLogin: self?.githubLogin ?? null }
}
