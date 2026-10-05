import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { alertRulesQuery } from '@/integrations/studio-api'
import {
  needsAttention,
  statusFor,
  useConsoleItems,
  useTriageRecords,
} from '../../../shared/console-data'
import { isInScope, useConsoleScope } from '../../../shared/console-scope'
import type { OverviewSignals } from '../types'
import { isBlockingReview, rankAttention } from '../utils'
import { ATTENTION_LIMIT } from '../values'

/** What is true right now, from the same lists the inbox reads, so both agree on every count. */
export function useOverviewSignals(): OverviewSignals {
  const { items, isLoading } = useConsoleItems()
  const records = useTriageRecords()
  const scope = useConsoleScope()
  const { data: rules } = useQuery({ ...alertRulesQuery(), retry: false })

  return useMemo(() => {
    const now = new Date()
    const open = items.filter((item) => {
      const status = statusFor(item, records, now)
      return !status.done && !status.snoozedUntil && isInScope(scope, item)
    })
    return {
      attention: rankAttention(open.filter(needsAttention)).slice(0, ATTENTION_LIMIT),
      blockingReviews: open.filter(isBlockingReview).length,
      alertsFiring: (rules ?? []).filter((rule) => rule.state === 'firing').length,
      alertsArmed: (rules ?? []).filter((rule) => rule.state === 'armed').length,
      isLoading,
    }
  }, [items, records, scope, rules, isLoading])
}
