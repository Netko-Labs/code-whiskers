import type { ReactElement } from 'react'
import type { Member } from '@/integrations/studio-api'

export type AssignMenuProps = {
  assigneeUserId: string | null
  isDisabled: boolean
  onAssign: (member: Member | null) => void
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  /** A childless element; the label stays "Assign" whatever renders it. */
  trigger?: ReactElement
}
