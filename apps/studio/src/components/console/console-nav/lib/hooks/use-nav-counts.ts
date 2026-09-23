import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { repositoriesQuery } from '@/integrations/studio-api'
import {
  inBucket,
  statusFor,
  useConsoleItems,
  useMembers,
  useTriageRecords,
  useViewer,
} from '../../../shared/console-data'
import type { ConsoleNavItem } from '../../../shared/console-model'
import { navKey } from '../utils'

/**
 * Counts only where a source answers; every other row stays blank rather than show a number that
 * means nothing. Sample data counts nothing.
 */
export function useNavCounts(): Record<string, number> {
  const { items, sample } = useConsoleItems()
  const records = useTriageRecords()
  const viewer = useViewer()
  const members = useMembers()
  const { data: repositories } = useQuery({ ...repositoriesQuery(), retry: false })

  return useMemo(() => {
    const counts: Record<string, number> = {}
    if (repositories?.length) counts['section:repositories'] = repositories.length
    if (members.length) counts['section:members'] = members.length
    if (sample) return counts

    const now = new Date()
    const statuses = items.map((item) => ({ item, status: statusFor(item, records, now) }))
    for (const bucket of ['inbox', 'assigned', 'snoozed'] as const) {
      counts[`bucket:${bucket}`] = statuses.filter(
        ({ status }) => !status.done && inBucket(status, bucket, viewer?.id),
      ).length
    }
    counts['section:pull-requests'] = items.filter((item) => item.kind === 'review').length
    counts['section:issues'] = statuses.filter(
      ({ item, status }) => item.kind === 'error' && item.severity !== 'ok' && !status.resolved,
    ).length
    return counts
  }, [items, sample, records, viewer, members, repositories])
}

export function countFor(counts: Record<string, number>, item: ConsoleNavItem): string {
  const count = counts[navKey(item)]
  return count ? count.toLocaleString() : ''
}
