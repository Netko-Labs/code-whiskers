import type { PaletteGroup } from './types'

export const PALETTE_GROUPS: PaletteGroup[] = ['Issues', 'Go to', 'Projects', 'Actions']

/** Server search starts at two characters; one letter matches everything. */
export const MIN_ISSUE_QUERY = 2
export const ISSUE_RESULTS = 8
export const ISSUE_SEARCH_DEBOUNCE_MS = 180

export const PALETTE_PLACEHOLDER = 'Search issues, pages, projects and actions…'
