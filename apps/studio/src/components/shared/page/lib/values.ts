import type { PageWidth } from './types'

export const PAGE_WIDTH: Record<PageWidth, string> = {
  full: 'w-full',
  default: 'mx-auto w-full max-w-[1200px]',
  narrow: 'mx-auto w-full max-w-[760px]',
}

/** Varied widths so a skeleton reads as text, not as a barcode. */
export const SKELETON_WIDTHS = ['w-3/5', 'w-2/5', 'w-1/2', 'w-1/3', 'w-2/3'] as const
