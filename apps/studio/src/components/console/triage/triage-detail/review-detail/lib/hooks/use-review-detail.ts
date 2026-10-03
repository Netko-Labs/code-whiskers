import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { rerunReview, whiskersReviewQuery, whiskersReviewsQuery } from '@/integrations/whiskers'
import type { ConsoleItem } from '../../../../../shared/console-model'
import { useConsoleStore } from '../../../../../use-console-store'
import type { ReviewDetailData } from '../types'

/** This push's review and findings, plus every other push on the same pull request, once each. */
export function useReviewDetail(item: ConsoleItem): ReviewDetailData {
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
      .filter((push, index, all) => all.findIndex((p) => p.headSha === push.headSha) === index)
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
          .then(() =>
            useConsoleStore
              .getState()
              .flash(`Reviewing #${prNumber} again — results land in a minute or two`),
          )
          .catch((error: Error) => useConsoleStore.getState().flash(error.message))
      },
    }
  }, [detail.data, detail.isLoading, detail.isError, reviews, item])
}
