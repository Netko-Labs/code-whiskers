import type { ReactNode } from 'react'

export type SettingsPageProps = {
  title: string
  description: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export type CopyButtonProps = {
  value: string
  /** What the toast calls it: "Key copied". */
  label: string
  className?: string
}

export type ExternalLinkProps = {
  href: string
  children: ReactNode
  className?: string
}
