import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { ResponseError } from '@/integrations/observability'
import { type WhiskersFinding, whiskersPullRequestReviewsQuery } from '@/integrations/whiskers'
import { findingRef, triageKey, useTriageRecords } from '../../../../shared/console-data'
import type { ReviewPageState } from '../types'
import { reviewPageData } from '../utils'

/** Every push of the pull request, read as of `reviewId`; dismissals come from studio. */
export function useReviewPage(reviewId: string): ReviewPageState {
  const records = useTriageRecords()
  const { data, isLoading, isError, error, refetch } = useQuery({
    ...whiskersPullRequestReviewsQuery(reviewId),
    retry: false,
  })

  return useMemo(() => {
    const anchor = data?.pushes[0]
    const scope = anchor ? `${anchor.owner}/${anchor.repo}` : ''
    const isDismissed = (finding: WhiskersFinding) =>
      records.get(triageKey(findingRef(scope, finding)))?.status === 'dismissed'
    const isMissing =
      error instanceof ResponseError && (error.status === 404 || error.status === 422)

    return {
      data: data ? reviewPageData(data, reviewId, isDismissed) : null,
      isLoading,
      isMissing,
      isError: isError && !isMissing,
      refetch: () => void refetch(),
    }
  }, [data, reviewId, records, isLoading, isError, error, refetch])
}
