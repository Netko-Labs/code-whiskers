import type { Member, Organization } from '@/integrations/studio-api'

export type MemberDirectory = {
  members: Member[]
  installations: Organization[]
  viewerId: string | undefined
  installUrl: string | undefined
  isLoading: boolean
  isError: boolean
  retry: () => void
}

export type MemberRowProps = {
  member: Member
  isViewer: boolean
}

export type MembersAccessProps = {
  installations: Organization[]
  installUrl: string | undefined
}
