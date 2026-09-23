import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { type TriageRecord, triageQuery } from '@/integrations/studio-api'
import { triageKey } from '../utils'

/** Keyed by `triageKey`, so a lookup ignores the casing GitHub and whiskers disagree on. */
export function useTriageRecords(): Map<string, TriageRecord> {
  const { data } = useQuery({ ...triageQuery(), retry: false })
  return useMemo(() => new Map((data ?? []).map((record) => [triageKey(record), record])), [data])
}
