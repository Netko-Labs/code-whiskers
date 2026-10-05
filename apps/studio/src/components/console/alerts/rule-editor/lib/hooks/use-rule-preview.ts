import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { alertPreviewQuery } from '@/integrations/alerts-api'
import type { PreviewState, RuleDraft } from '../types'
import { previewInputOf } from '../utils'
import { PREVIEW_DEBOUNCE_MS } from '../values'
import { useDebouncedValue } from './use-debounced-value'

/** "Would have fired N times in the last 7 days", recounted when the condition settles. */
export function useRulePreview(draft: RuleDraft): PreviewState {
  const input = useMemo(() => previewInputOf(draft), [draft])
  const settled = useDebouncedValue(input, PREVIEW_DEBOUNCE_MS)
  const preview = useQuery({ ...alertPreviewQuery(settled), placeholderData: keepPreviousData })

  if (!settled) return { status: 'idle' }
  if (preview.isError) return { status: 'unavailable' }
  if (!preview.data) return { status: 'loading' }
  return { status: 'ready', preview: preview.data }
}
