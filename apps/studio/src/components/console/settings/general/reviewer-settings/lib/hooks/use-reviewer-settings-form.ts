import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  instanceReviewerQuery,
  type ReviewerSettings,
  reviewerSettingsQuery,
  updateReviewerSettings,
} from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../../use-console-store'
import type { ReviewerDraft, ReviewerSettingsForm } from '../types'
import { draftFrom, parseDraft } from '../utils'

/** Edits stay local until saved; the worker's status refetches so the panel above shows the change. */
export function useReviewerSettingsForm(): ReviewerSettingsForm {
  const queryClient = useQueryClient()
  const query = useQuery({ ...reviewerSettingsQuery(), retry: false })
  const [edits, setEdits] = useState<Partial<ReviewerDraft>>({})
  const saved = draftFrom(query.data?.settings)
  const draft = { ...saved, ...edits }
  const parsed = parseDraft(draft)

  const mutation = useMutation({
    mutationFn: (settings: ReviewerSettings) => updateReviewerSettings(settings),
    onSuccess: (record) => {
      queryClient.setQueryData(reviewerSettingsQuery().queryKey, record)
      void queryClient.invalidateQueries({
        queryKey: instanceReviewerQuery().queryKey,
        exact: true,
      })
      setEdits({})
      useConsoleStore.getState().flash('Reviewer settings saved')
    },
    onError: (error: Error) => useConsoleStore.getState().flash(error.message),
  })

  return {
    draft,
    error: parsed.error,
    isDirty: Object.entries(edits).some(
      ([field, value]) => value !== saved[field as keyof ReviewerDraft],
    ),
    isPending: mutation.isPending,
    isLoading: query.isPending,
    isError: query.isError,
    retry: () => void query.refetch(),
    setField: (field, value) => setEdits((current) => ({ ...current, [field]: value })),
    reset: () => setEdits({}),
    save: () => {
      if (parsed.settings) mutation.mutate(parsed.settings)
    },
  }
}
