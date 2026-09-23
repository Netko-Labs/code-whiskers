import { useMemo } from 'react'
import { useConsoleItems } from '../../../shared/console-data'
import type { ConsoleItem, ConsoleNotification } from '../../../shared/console-model'
import { useConsoleStore } from '../../../use-console-store'
import type { NotificationsResult } from '../types'
import { MAX_NOTIFICATIONS, NOTIFICATION_WINDOW_MS } from '../values'

function needsAttention(item: ConsoleItem): boolean {
  return item.severity === 'critical' || item.severity === 'warning'
}

function toNotification(item: ConsoleItem): ConsoleNotification {
  const what =
    item.kind === 'review'
      ? `${item.handle} ${item.meta === 'review failed' ? 'review failed' : 'needs changes'}`
      : item.title
  return { title: what, when: `${item.age} ago`, severity: item.severity, itemId: item.id }
}

/** Live items that need a human, from the last week; read state is per browser session. */
export function useNotifications(): NotificationsResult {
  const { items, sample } = useConsoleItems()
  const readIds = useConsoleStore((s) => s.readIds)

  return useMemo(() => {
    if (sample) return { notes: [], unreadIds: new Set<string>() }
    const since = Date.now() - NOTIFICATION_WINDOW_MS
    const notes = items
      .filter((item) => needsAttention(item) && item.at && item.at.getTime() >= since)
      .sort((a, b) => (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0))
      .slice(0, MAX_NOTIFICATIONS)
      .map(toNotification)
    return {
      notes,
      unreadIds: new Set(notes.filter((n) => !readIds[n.itemId]).map((n) => n.itemId)),
    }
  }, [items, sample, readIds])
}
