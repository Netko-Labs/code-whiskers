import type { StudioStorage } from '@/integrations/studio-api'
import type { WhiskersInstance } from '@/integrations/whiskers'
import type { StoreRow } from './types'

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const

export function formatBytes(bytes: number): string {
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${BYTE_UNITS[unit]}`
}

/** Both databases in one list, largest first: what is actually taking the disk. */
export function mergeStores(
  worker: WhiskersInstance | undefined,
  studio: StudioStorage | undefined,
): StoreRow[] {
  return [
    ...(worker?.stores ?? []).map((store) => ({ ...store, database: 'whiskers' as const })),
    ...(studio?.stores ?? []).map((store) => ({
      ...store,
      database: 'studio' as const,
      isEstimate: false,
    })),
  ].sort((a, b) => b.bytes - a.bytes)
}

export function formatSeconds(seconds: number): string {
  if (seconds < 90) return `${Math.round(seconds)}s`
  if (seconds < 5400) return `${Math.round(seconds / 60)}m`
  return `${(seconds / 3600).toFixed(1)}h`
}

export function perReview(total: number, reviews: number): string {
  return reviews > 0 ? Math.round(total / reviews).toLocaleString() : '—'
}
