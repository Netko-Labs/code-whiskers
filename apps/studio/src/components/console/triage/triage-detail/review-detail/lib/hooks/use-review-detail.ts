import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  rerunReview,
  WHISKERS_QUERY_KEY,
  whiskersReviewQuery,
  whiskersReviewsQuery,
} from '@/integrations/whiskers'
import type { ConsoleItem } from '../../../../../shared/console-model'
import { useConsoleStore } from '../../../../../use-console-store'
import type { ReviewDetailData } from '../types'

const RERUN_SETTLE_MS = 30_000

/** This push's review and findings, plus every other push on the same pull request. */
export function useReviewDetail(item: ConsoleItem): ReviewDetailData {
  const queryClient = useQueryClient()
  const detail = useQuery({
    ...whiskersReviewQuery(item.sourceId ?? ''),
    enabled: !!item.sourceId,
    retry: false,
  })
  const { data: reviews } = useQuery({ ...whiskersReviewsQuery(), retry: false })

  return useMemo(() => {
    const slug = item.repository?.toLowerCase()
    const pushes = (reviews ?? [])
      .filter(
        (review) =>
          `${review.owner}/${review.repo}`.toLowerCase() === slug &&
          `#${review.prNumber}` === item.handle,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    const review = detail.data?.review

    return {
      review,
      findings: detail.data?.findings ?? [],
      pushes,
      isLoading: detail.isLoading,
      isError: detail.isError,
      rerun: () => {
        if (!review) return
        const { owner, repo, prNumber } = review
        rerunReview({ owner, repo, prNumber })
          .then(() => {
            useConsoleStore
              .getState()
              .flash(`Reviewing #${prNumber} again — results land in a minute or two`)
            setTimeout(
              () => void queryClient.invalidateQueries({ queryKey: [WHISKERS_QUERY_KEY] }),
              RERUN_SETTLE_MS,
            )
          })
          .catch((error: Error) => useConsoleStore.getState().flash(error.message))
      },
    }
  }, [detail.data, detail.isLoading, detail.isError, reviews, item, queryClient])
}
