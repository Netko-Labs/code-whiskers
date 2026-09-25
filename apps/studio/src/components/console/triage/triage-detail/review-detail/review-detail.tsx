import { ItemThread } from '../item-thread'
import { type ReviewDetailProps, useFindingDecisions, useReviewDetail } from './lib'
import { ReviewFindings } from './review-findings'
import { ReviewOutcome } from './review-outcome'
import { ReviewRead } from './review-read'
import { ReviewSampleEvidence } from './review-sample-evidence'
import { ReviewSidebar } from './review-sidebar'

export function ReviewDetail({ item, actions }: ReviewDetailProps) {
  const detail = useReviewDetail(item)
  const decisions = useFindingDecisions(item, detail.findings)

  return (
    <div className="@container">
      <div className="grid gap-6 @[720px]:grid-cols-[minmax(0,1fr)_260px]">
        <div className="flex min-w-0 flex-col gap-5">
          <ReviewOutcome
            review={detail.review}
            open={decisions.open}
            className="flex @[720px]:hidden"
          />
          <ReviewRead item={item} />
          <ReviewSampleEvidence item={item} actions={actions} />
          {item.sourceId && (
            <ReviewFindings item={item} detail={detail} decisions={decisions} actions={actions} />
          )}
          <ItemThread item={item} onPost={actions.postComment} />
        </div>
        <div>
          <div className="@[720px]:sticky @[720px]:top-0">
            <ReviewSidebar item={item} detail={detail} open={decisions.open} />
          </div>
        </div>
      </div>
    </div>
  )
}
