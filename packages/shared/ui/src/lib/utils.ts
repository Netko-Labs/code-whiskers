import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// The design tokens' own names (styles/tokens.css). Unregistered, tailwind-merge reads `text-ui`
// as a text colour and drops it beside `text-foreground`, so the text falls back to 16px.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['2xs', 'ui', 'nav', 'title', 'heading', 'display'],
      shadow: ['raised', 'overlay', 'panel'],
      spacing: ['row', 'row-compact', 'topbar', 'sidebar', 'rail', 'gutter'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
