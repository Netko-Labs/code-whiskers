import { useShallow } from 'zustand/react/shallow'
import { useConsoleStore } from '../../../use-console-store'
import type { TriageStatus } from '../types'

export function useItemStatus(id: string): TriageStatus {
  return useConsoleStore(
    useShallow((s) => {
      const resolved = !!s.resolved[id]
      const approved = !!s.approved[id]
      const tracked = !!s.tracked[id]
      return {
        resolved,
        approved,
        tracked,
        dismissed: !!s.dismissed[id],
        done: resolved || approved || tracked,
      }
    }),
  )
}
