import { useMemo } from 'react'
import type { WhiskersFinding } from '@/integrations/whiskers'
import { findingRef, triageKey, useTriageRecords } from '../../../../../shared/console-data'
import type { ConsoleItem } from '../../../../../shared/console-model'
import type { FindingDecisions } from '../types'

/** Dismissals are keyed by file and title, so they survive a re-review of the same push. */
export function useFindingDecisions(
  item: ConsoleItem,
  findings: WhiskersFinding[],
): FindingDecisions {
  const records = useTriageRecords()
  return useMemo(() => {
    const scope = item.triage?.scope ?? ''
    const isDismissed = (finding: WhiskersFinding) =>
      records.get(triageKey(findingRef(scope, finding)))?.status === 'dismissed'
    const open = findings.filter((finding) => !isDismissed(finding))
    return { open, dismissedCount: findings.length - open.length, isDismissed }
  }, [item, findings, records])
}
