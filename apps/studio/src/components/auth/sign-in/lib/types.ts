import type { CatExpressionName } from '@code-whiskers/ui/brand'

export interface NavLink {
  label: string
  href: string
  emphasis?: boolean
}

export interface FooterLink {
  label: string
  href: string
}

export interface BackdropTile {
  expression: CatExpressionName
  rotate: number
}
