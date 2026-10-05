import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeaderSkeleton, PanelSkeleton } from '@/components/shared/page'
import type { IssuePeriod } from '@/integrations/whiskers'
import { IssueEvent } from './issue-event'
import { IssueHeader } from './issue-header'
import { IssueHistogram, IssueStats } from './issue-overview'
import { IssueRail } from './issue-rail'
import { type IssueDetailProps, MISSING_ISSUE, useIssueDetail } from './lib'

/** Two columns when there is room (evidence left, context right); one column in the triage pane. */
export function IssueDetail({ issueId, seed, lead }: IssueDetailProps) {
  const [period, setPeriod] = useState<IssuePeriod>('24h')
  const { issue, detail, isMissing } = useIssueDetail(issueId, seed, period)

  if (!issue) {
    return isMissing ? (
      <EmptyState expression="confused" title="Issue not found" description={MISSING_ISSUE} />
    ) : (
      <div className="flex flex-1 flex-col gap-4">
        <PageHeaderSkeleton />
        <PanelSkeleton rows={4} className="mx-gutter" />
      </div>
    )
  }

  return (
    <div className="@container flex min-h-0 flex-1 flex-col">
      <IssueHeader issue={issue} />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <IssueStats issue={issue} />
        <div className="grid gap-x-8 gap-y-6 px-8 py-6 @5xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex min-w-0 flex-col gap-6">
            {lead}
            <IssueHistogram detail={detail} period={period} onPeriod={setPeriod} />
            <IssueEvent key={issue.id} issue={issue} tags={detail?.tags ?? []} />
          </div>
          <IssueRail issue={issue} detail={detail} />
        </div>
      </div>
    </div>
  )
}
