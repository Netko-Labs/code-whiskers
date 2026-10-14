import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  instanceReviewerQuery,
  type ReviewerCredentialInput,
  type ReviewerCredentialName,
  reviewerSettingsQuery,
  setReviewerCredential,
} from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../../use-console-store'
import type { ReviewerCredentialForm } from '../types'

/** Write-only: the typed value is cleared the moment studio has it. */
export function useReviewerCredential(name: ReviewerCredentialName): ReviewerCredentialForm {
  const queryClient = useQueryClient()
  const [value, setValue] = useState('')

  const mutation = useMutation({
    mutationFn: (input: ReviewerCredentialInput) => setReviewerCredential(input),
    onSuccess: (record, input) => {
      queryClient.setQueryData(reviewerSettingsQuery().queryKey, record)
      void queryClient.invalidateQueries({
        queryKey: instanceReviewerQuery().queryKey,
        exact: true,
      })
      setValue('')
      useConsoleStore.getState().flash(input.value ? `${name} stored` : `${name} removed`)
    },
    onError: (error: Error) => useConsoleStore.getState().flash(error.message),
  })

  return {
    value,
    isPending: mutation.isPending,
    setValue,
    save: () => {
      const trimmed = value.trim()
      if (trimmed) mutation.mutate({ name, value: trimmed })
    },
    remove: () => mutation.mutate({ name, value: null }),
  }
}
