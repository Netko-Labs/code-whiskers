import type { WhiskersHotspot } from '@/integrations/whiskers'
import { SEVERITY_ORDER, SEVERITY_TONE } from '../../shared/review-model'
import type { HotspotFilter, HotspotRow } from './types'

export function blockingOf(spot: WhiskersHotspot): number {
  return spot.critical + spot.high
}

/** Bars share one scale, the busiest directory's count, so lengths compare across rows. */
export function hotspotRows(spots: WhiskersHotspot[], filter: HotspotFilter): HotspotRow[] {
  const needle = filter.query.trim().toLowerCase()
  const visible = spots.filter(
    (spot) =>
      (!filter.isBlockingOnly || blockingOf(spot) > 0) &&
      (!needle ||
        `${spot.repository} ${spot.directory} ${spot.owners.join(' ')}`
          .toLowerCase()
          .includes(needle)),
  )
  const scale = Math.max(1, ...visible.map((spot) => spot.findings))
  return visible.map((spot) => ({
    spot,
    key: `${spot.repository}:${spot.directory}`,
    blocking: blockingOf(spot),
    segments: SEVERITY_ORDER.filter((severity) => spot[severity] > 0).map((severity) => ({
      key: severity,
      tone: SEVERITY_TONE[severity],
      count: spot[severity],
      percent: (spot[severity] / scale) * 100,
    })),
  }))
}

export function treeUrl(spot: Pick<WhiskersHotspot, 'repository' | 'directory'>): string {
  const path = spot.directory === '.' ? '' : spot.directory
  return `https://github.com/${spot.repository}/tree/HEAD/${path}`
}
