import { useShallow } from 'zustand/react/shallow'
import { NOTIFICATIONS } from '../../../shared/console-data'
import { useConsoleStore } from '../../../use-console-store'

/** A notification stays unread until it is opened or the whole list is marked read. */
export function useUnreadNotifications() {
  return useConsoleStore(
    useShallow((s) => NOTIFICATIONS.filter((n) => n.unread && !s.readIds[n.itemId])),
  )
}
