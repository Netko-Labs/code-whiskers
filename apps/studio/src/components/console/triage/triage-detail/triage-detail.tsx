import { IssueDetail } from '../../issue-detail'
import { bannerFor, type TriageDetailProps, useDetailActions, useItemStatus } from '../lib'
import { AlertDetail } from './alert-detail'
import { DetailAssistant } from './detail-assistant'
import { DetailHeader } from './detail-header'
import { ItemThread } from './item-thread'
import { LogDetail } from './log-detail'
import { ReviewDetail } from './review-detail'

export function TriageDetail({ item }: TriageDetailProps) {
  const status = useItemStatus(item)
  const actions = useDetailActions(item)

  if (item.issue) {
    return (
      <div className="flex min-h-0 flex-1 animate-enter flex-col">
        <IssueDetail issueId={item.issue.id} seed={item.issue} />
      </div>
    )
  }
  if (item.alert) return <AlertDetail rule={item.alert} />

  return (
    <div className="flex min-h-0 flex-1 animate-enter flex-col">
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
            <DetailAssistant item={item} />
            <LogDetail item={item} />
            <ItemThread item={item} onPost={actions.postComment} />
          </>
        )}
      </div>
    </div>
  )
}
