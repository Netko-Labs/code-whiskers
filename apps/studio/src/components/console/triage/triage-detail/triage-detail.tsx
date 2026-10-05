import { IssueDetail } from '../../issue-detail'
import { FixDrawerSlot } from '../fix-drawer'
import { bannerFor, type TriageDetailProps, useDetailActions, useItemStatus } from '../lib'
import { DetailAssistant } from './detail-assistant'
import { DetailHeader } from './detail-header'
import { ErrorDetail } from './error-detail'
import { ItemThread } from './item-thread'
import { LogDetail } from './log-detail'
import { ReviewDetail } from './review-detail'

export function TriageDetail({ item }: TriageDetailProps) {
  const status = useItemStatus(item)
  const actions = useDetailActions(item)

  if (item.kind === 'error' && item.issue) {
    const lead = item.fixLabel ? <DetailAssistant item={item} actions={actions} /> : undefined
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <IssueDetail key={item.issue.id} issueId={item.issue.id} seed={item.issue} lead={lead} />
        <FixDrawerSlot item={item} actions={actions} />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DetailHeader
        item={item}
        status={status}
        actions={actions}
        banner={bannerFor(item, status)}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-8 py-6">
        {item.kind === 'review' ? (
          <ReviewDetail item={item} actions={actions} />
        ) : (
          <>
            <DetailAssistant item={item} actions={actions} />
            {item.kind === 'log' && <LogDetail item={item} />}
            {item.kind === 'error' && <ErrorDetail item={item} />}
            <ItemThread item={item} onPost={actions.postComment} />
          </>
        )}
      </div>
      <FixDrawerSlot item={item} actions={actions} />
    </div>
  )
}
