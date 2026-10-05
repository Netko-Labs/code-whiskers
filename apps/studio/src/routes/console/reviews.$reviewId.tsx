import { createFileRoute } from '@tanstack/react-router'
import { ReviewPage } from '@/components/console/code-review'

function ReviewRoute() {
  const { reviewId } = Route.useParams()
  return <ReviewPage reviewId={reviewId} />
}

export const Route = createFileRoute('/console/reviews/$reviewId')({
  component: ReviewRoute,
})
