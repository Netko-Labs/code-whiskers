export const RELEASE_TABS = ['overview', 'commits', 'deploys'] as const

export const RELEASE_TAB_LABELS = {
  overview: 'Overview',
  commits: 'Commits',
  deploys: 'Deploys',
} as const

export const MISSING_RELEASE =
  'No release by that version in this project. It may belong to another project, or none reported it yet.'

export const META_LINK = 'focus-ring rounded-sm font-mono text-foreground hover:underline'
