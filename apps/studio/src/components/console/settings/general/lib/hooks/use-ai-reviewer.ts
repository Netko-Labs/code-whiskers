import { useMutation, useQuery } from '@tanstack/react-query'
import { instanceReviewerQuery, testInstanceReviewer } from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import type { AiReviewer } from '../types'

/** The worker's reviewer as configured, plus a test run on demand — it spends a few tokens. */
export function useAiReviewer(): AiReviewer {
  const query = useQuery({ ...instanceReviewerQuery(), retry: false })
  const mutation = useMutation({
    mutationFn: testInstanceReviewer,
    onError: (error: Error) => useConsoleStore.getState().flash(error.message),
  })

  return {
    reviewer: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    retry: () => void query.refetch(),
    test: mutation.data ?? null,
    isTesting: mutation.isPending,
    runTest: () => mutation.mutate(),
  }
}
