import type { Icon } from '@tabler/icons-react'

export type DestinationIconComponent = Icon

export type DestinationIconProps = {
  kind: string
  className?: string
  /** Read the kind aloud when the icon stands alone. */
  isLabelled?: boolean
}
