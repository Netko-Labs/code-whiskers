import type { ReactNode } from 'react'

export type SplitViewProps = {
  list: ReactNode
  /** `null` gives the list the full width; the detail pane slides in when it arrives. */
  detail: ReactNode | null
  /** Percent as a string ("42") or pixels as a number, per react-resizable-panels. */
  listDefaultSize?: number | string
  listMinSize?: number | string
  detailMinSize?: number | string
  className?: string
}
