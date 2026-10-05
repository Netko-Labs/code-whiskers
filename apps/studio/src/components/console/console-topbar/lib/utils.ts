import { NAV_GROUPS, NAV_PRIMARY } from '../../shared/console-data'
import type { Crumb, ProjectNameLookup } from './types'
import { SHORT_ID } from './values'

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
  if (area === 'projects') {
    if (!id || id === 'new') return [{ label: 'Projects' }, { label: 'New project' }]
    const name = projectName(id)
    return [{ label: 'Projects' }, { label: name ?? id.slice(0, SHORT_ID), isMono: !name }]
  }
  return sectionCrumbs(area)
}
