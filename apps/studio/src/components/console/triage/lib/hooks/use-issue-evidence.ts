import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { whiskersLatestEventQuery } from '@/integrations/whiskers'
import type { ConsoleItem } from '../../../shared/console-model'
import type { IssueEvidence } from '../types'
import { evidenceFromEvent } from '../utils'

/** Sample issues carry their own evidence; live ones read the newest event from whiskers. */
export function useIssueEvidence(item: ConsoleItem): IssueEvidence {
  const { data, isLoading } = useQuery({
    ...whiskersLatestEventQuery(item.sourceId ?? ''),
    enabled: !!item.sourceId && item.kind === 'error',
    retry: false,
  })
  return useMemo(() => {
    if (!item.sourceId) {
      return {
        frames: item.trace ?? [],
        crumbs: item.crumbs ?? [],
        logs: item.logContext ?? [],
        tags: item.tags ?? [],
        hiddenNote: item.trace?.length ? '3 frames hidden (node_modules)' : undefined,
        isLoading: false,
      }
    }
    return { ...evidenceFromEvent(data, item.tags ?? []), isLoading }
  }, [item, data, isLoading])
}
