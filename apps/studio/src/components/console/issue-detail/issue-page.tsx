import { IssueDetail } from './issue-detail'
import type { IssuePageProps } from './lib'

/** The issue on its own page; the top bar's breadcrumbs lead back to the list. */
export function IssuePage({ issueId }: IssuePageProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <IssueDetail key={issueId} issueId={issueId} />
    </div>
  )
}
