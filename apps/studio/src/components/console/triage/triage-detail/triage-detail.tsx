import { useMembers } from '../../shared/console-data'
import { FixDrawerSlot } from '../fix-drawer'
import { bannerFor, type TriageDetailProps, useDetailActions, useItemStatus } from '../lib'
import { DetailAssistant } from './detail-assistant'
import { DetailBanner } from './detail-banner'
import { DetailHeader } from './detail-header'
import { DetailStats } from './detail-stats'
import { ErrorDetail } from './error-detail'
import { ItemThread } from './item-thread'
import { LogDetail } from './log-detail'
import { ReviewDetail } from './review-detail'

export function TriageDetail({ item }: TriageDetailProps) {
  const status = useItemStatus(item)
  const actions = useDetailActions(item)
  const members = useMembers()
  const owner = members.find((m) => m.id === status.assigneeUserId)?.name ?? 'Unassigned'
  const banner = bannerFor(item, status)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DetailHeader item={item} status={status} actions={actions} />
      {banner && <DetailBanner banner={banner} />}
      {item.kind === 'error' && <DetailStats item={item} owner={owner} />}

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-6 py-5">
        <DetailAssistant item={item} actions={actions} />
        {item.kind === 'error' && <ErrorDetail item={item} />}
        {item.kind === 'review' && <ReviewDetail item={item} actions={actions} />}
        {item.kind === 'log' && <LogDetail item={item} />}
        <ItemThread item={item} onPost={actions.postComment} />
      </div>
      <FixDrawerSlot item={item} actions={actions} />
    </div>
  )
}
