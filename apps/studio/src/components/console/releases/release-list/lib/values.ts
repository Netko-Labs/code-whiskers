export const RELEASES_TITLE = 'Releases'
export const RELEASES_DESCRIPTION =
  'What each release brought in, where it runs, and what went into it'
export const RELEASE_TABS = ['All', 'With new issues'] as const
export const MAX_ENV_CHIPS = 3
export const SPARK_WIDTH = 64
export const SPARK_HEIGHT = 16
/** Trailing column widths, shared by the header and every row so they line up. */
export const COLUMN = {
  envs: 'w-56',
  newIssues: 'w-20 text-right',
  events: 'w-24',
  commits: 'w-16 text-right',
  deployed: 'w-36',
  age: 'w-14 text-right',
} as const
