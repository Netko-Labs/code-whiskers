import { useMemo } from 'react'
import {
  statusFor,
  useConsoleItems,
  useTriageRecords,
  useViewer,
} from '../../../shared/console-data'
import type { ConsoleItem, ConsoleNotification } from '../../../shared/console-model'
import { useConsoleStore } from '../../../use-console-store'
import type { NotificationsResult } from '../types'
import { MAX_NOTIFICATIONS, NOTIFICATION_WINDOW_MS } from '../values'

function needsAttention(item: ConsoleItem): boolean {
  return item.severity === 'critical' || item.severity === 'warning'
}

function toNotification(item: ConsoleItem, isAssigned: boolean): ConsoleNotification {
  const what =
    item.kind === 'review'
      ? `${item.handle} ${item.meta === 'review failed' ? 'review failed' : item.meta}`
      : item.title
  return {
    title: isAssigned ? `Assigned to you: ${what}` : what,
    when: `${item.age} ago`,
    severity: item.severity,
    itemId: item.id,
  }
}

/**
 * Live items that need a human from the last week, plus anything assigned to the viewer that is
 * not done yet. Read state is per browser session.
 */
export function useNotifications(): NotificationsResult {
  const { items, sample } = useConsoleItems()
  const records = useTriageRecords()
  const viewer = useViewer()
  const readIds = useConsoleStore((s) => s.readIds)

  return useMemo(() => {
    if (sample) return { notes: [], unreadIds: new Set<string>() }
    const since = Date.now() - NOTIFICATION_WINDOW_MS
    const notes = items
      .map((item) => {
        const status = statusFor(item, records)
        const isAssigned = !!viewer && status.assigneeUserId === viewer.id && !status.done
        const isRecent =
          needsAttention(item) && !status.done && !!item.at && item.at.getTime() >= since
        return { item, isAssigned, isRelevant: isAssigned || isRecent }
      })
      .filter((entry) => entry.isRelevant)
      .sort(
        (a, b) =>
          Number(b.isAssigned) - Number(a.isAssigned) ||
          (b.item.at?.getTime() ?? 0) - (a.item.at?.getTime() ?? 0),
      )
      .slice(0, MAX_NOTIFICATIONS)
      .map((entry) => toNotification(entry.item, entry.isAssigned))
    return {
      notes,
      unreadIds: new Set(notes.filter((n) => !readIds[n.itemId]).map((n) => n.itemId)),
    }
  }, [items, sample, records, viewer, readIds])
}
