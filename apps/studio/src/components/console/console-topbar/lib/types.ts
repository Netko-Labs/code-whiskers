import type { ReactNode } from 'react'
import type { SectionView } from '../../shared/console-model'

export type Crumb = {
  label: string
  /** Ids and hashes read as evidence. */
  isMono?: boolean
  /** Earlier crumbs that are a section link back to it. */
  section?: SectionView
}

export type ProjectNameLookup = (projectId: string) => string | undefined

export type TopbarActionsProps = {
  children: ReactNode
}

export type ConsoleBreadcrumbsProps = {
  crumbs: Crumb[]
}
