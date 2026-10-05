import type { Crumb } from './types'

export const TOPBAR_BUTTON =
  'focus-ring flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground'

export const SHORT_ID = 8

export const PROJECTS_PATH = '/console/projects'
export const SETTINGS_PATH = '/console/settings/general'

/** The pages under /console/alerts; any other segment is a rule id. */
export const ALERT_CRUMBS: Record<string, Crumb> = {
  activity: { label: 'Activity' },
  destinations: { label: 'Destinations' },
  new: { label: 'New rule' },
}
