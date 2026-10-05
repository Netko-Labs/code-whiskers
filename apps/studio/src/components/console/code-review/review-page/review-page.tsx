import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { Page, PageHeaderSkeleton, PanelSkeleton } from '@/components/shared/page'
import { MISSING_REVIEW, type ReviewPageProps, useReviewActions, useReviewPage } from './lib'
import { ReviewFindings } from './review-findings'
import { ReviewHeader } from './review-header'
import { ReviewRail } from './review-rail'
import { ReviewSummary } from './review-summary'

/** One pull request as of one push: evidence left, the push timeline and facts right. */
export function ReviewPage({ reviewId }: ReviewPageProps) {
  const state = useReviewPage(reviewId)
  const actions = useReviewActions(state.data?.latest)

  if (state.isMissing) {
    return (
      <EmptyState
        expression="confused"
        title="Review not found"
        description={MISSING_REVIEW}
        action={
          <Link to="/console/pull-requests" className={buttonVariants({ size: 'sm' })}>
            All pull requests
          </Link>
        }
      />
    )
  }
  if (state.isError) {
    return (
      <ErrorState
        title="Whiskers did not answer"
        description="The review worker is unreachable right now."
        onRetry={state.refetch}
      />
    )
  }
  if (!state.data) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <PageHeaderSkeleton />
        <PanelSkeleton rows={5} className="mx-gutter" />
      </div>
    )
  }

  const { data } = state
  return (
    <Page className="@container">
      <ReviewHeader data={data} actions={actions} />
      <div className="grid animate-enter-up gap-x-8 gap-y-6 px-gutter py-6 @5xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-8">
          <ReviewSummary data={data} />
          <ReviewFindings data={data} actions={actions} />
        </div>
        <ReviewRail data={data} />
      </div>
    </Page>
  )
}
