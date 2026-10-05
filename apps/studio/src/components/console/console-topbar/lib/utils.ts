import { NAV_GROUPS, NAV_PRIMARY, settingsLabelFor } from '../../shared/console-data'
import { shortRelease } from '../../shared/issue-lifecycle'
import type { Crumb, ProjectNameLookup } from './types'
import { ALERT_CRUMBS, ALERTS_PATH, PROJECTS_PATH, SETTINGS_PATH, SHORT_ID } from './values'

function sectionCrumbs(section: string): Crumb[] {
  for (const group of NAV_GROUPS) {
    const item = group.items.find(
      (candidate) =>
        candidate.params && 'section' in candidate.params && candidate.params.section === section,
    )
    if (item) return [{ label: group.label }, { label: item.label }]
  }
  return []
}

/** A malformed escape stays as typed rather than breaking the bar. */
function decodedSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

/** The top bar's trail, read off the URL alone so it is right on the first paint. */
export function crumbsFor(pathname: string, projectName: ProjectNameLookup): Crumb[] {
  const [, area, id] = pathname.split('/').filter(Boolean)
  if (!area) return []

  if (area === 'overview') return [{ label: 'Overview' }]
  if (area === 'triage') {
    const item = NAV_PRIMARY.find(
      (candidate) =>
        candidate.params && 'bucket' in candidate.params && candidate.params.bucket === id,
    )
    return [{ label: 'Triage' }, { label: item?.label ?? 'Inbox' }]
  }
  if (area === 'issues' && id) {
    return [
      { label: 'Errors' },
      { label: 'Issues', section: 'issues' },
      { label: id.slice(0, SHORT_ID), isMono: true },
    ]
  }
  if (area === 'reviews' && id) {
    return [
      { label: 'Code review' },
      { label: 'Pull requests', section: 'pull-requests' },
      { label: id.slice(0, SHORT_ID), isMono: true },
    ]
  }
  if (area === 'releases' && id) {
    return [
      { label: 'Errors' },
      { label: 'Releases', section: 'releases' },
      { label: shortRelease(decodedSegment(id)), isMono: true },
    ]
  }
  if (area === 'alerts') {
    if (!id) return [{ label: 'Errors' }, { label: 'Alerts' }]
    return [
      { label: 'Errors' },
      { label: 'Alerts', to: ALERTS_PATH },
      ALERT_CRUMBS[id] ?? { label: 'Rule' },
    ]
  }
  if (area === 'projects') {
    if (!id) return [{ label: 'Projects' }]
    const projects = { label: 'Projects', to: PROJECTS_PATH }
    if (id === 'new') return [projects, { label: 'New project' }]
    const name = projectName(id)
    return [projects, { label: name ?? id.slice(0, SHORT_ID), isMono: !name }]
  }
  if (area === 'settings') {
    return [
      { label: 'Settings', to: SETTINGS_PATH },
      { label: settingsLabelFor(pathname) ?? 'General' },
    ]
  }
  return sectionCrumbs(area)
}
