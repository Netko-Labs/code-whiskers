import type { CSSProperties } from 'react'
import type { CatPalette, CatTone } from './types'
import { CAT_PALETTES } from './values'

// Fills read CSS variables so ink/paper/accent can be any CSS color, including theme vars
export const paletteStyle = (
  tone: CatTone,
  { ink, paper, accent }: Partial<CatPalette>,
): CSSProperties =>
  ({
    '--cw-ink': ink ?? CAT_PALETTES[tone].ink,
    '--cw-bg': paper ?? CAT_PALETTES[tone].paper,
    '--cw-accent': accent ?? CAT_PALETTES[tone].accent,
    '--cw-glint': accent ?? CAT_PALETTES[tone].glint,
  }) as CSSProperties
