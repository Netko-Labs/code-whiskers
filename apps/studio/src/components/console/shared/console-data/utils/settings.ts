import { SETTINGS_NAV } from '../values'

/** The settings tab a path opens, for breadcrumbs; undefined outside the settings layout. */
export function settingsLabelFor(pathname: string): string | undefined {
  const path = pathname.replace(/\/+$/, '')
  return SETTINGS_NAV.flatMap((group) => group.entries).find(
    (entry) => !entry.isElsewhere && entry.to === path,
  )?.label
}
