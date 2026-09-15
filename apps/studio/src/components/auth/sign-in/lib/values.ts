import type { BackdropTile, FooterLink, NavLink } from './types'

export const BRAND_NAME = 'Code Whiskers'
export const SIGN_IN_HEADLINE = 'Three tools, one reviewer that never gets loud.'
export const SIGN_IN_COPYRIGHT = '© 2026 Netko Labs'

export const NAV_LINKS: NavLink[] = [
  { label: 'Docs', href: 'https://github.com/Netko-Labs/code-whiskers#readme' },
  { label: 'Changelog', href: 'https://github.com/Netko-Labs/code-whiskers/releases' },
  { label: 'Sign in', href: '/sign-in', emphasis: true },
]

export const FOOTER_LINKS: FooterLink[] = [
  { label: 'Terms', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Security', href: '#' },
]

export const BACKDROP_INK = '#1F1F22'
export const BACKDROP_PAPER = '#09090B'
export const BACKDROP_TILE_SIZE = 124
export const BACKDROP_CELL_SIZE = 160
export const BACKDROP_TILE_COUNT = 96

export const BACKDROP_TILES: BackdropTile[] = [
  { expression: 'idle', rotate: -8 },
  { expression: 'approved', rotate: 6 },
  { expression: 'found', rotate: -4 },
  { expression: 'sleeping', rotate: 10 },
  { expression: 'blocker', rotate: 6 },
  { expression: 'reviewing', rotate: -4 },
  { expression: 'thinking', rotate: 10 },
  { expression: 'idle', rotate: -8 },
  { expression: 'found', rotate: -4 },
  { expression: 'sleeping', rotate: 10 },
  { expression: 'confused', rotate: -8 },
  { expression: 'blocker', rotate: 6 },
  { expression: 'thinking', rotate: 10 },
  { expression: 'idle', rotate: -8 },
  { expression: 'approved', rotate: 6 },
  { expression: 'found', rotate: -4 },
]
