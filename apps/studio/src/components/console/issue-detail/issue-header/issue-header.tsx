import { useQuery } from '@tanstack/react-query'
import { whiskersProjectsQuery } from '@/integrations/whiskers'
import { statusBanner } from '../../shared/issue-lifecycle'
import { IssueBadges, LevelRule } from '../../shared/issue-ui'
import { type IssueHeaderProps, useIssueActions } from '../lib'
import { IssueActions } from './issue-actions'
import { IssueBanner } from './issue-banner'

export function IssueHeader({ issue }: IssueHeaderProps) {
  const actions = useIssueActions(issue)
  const { data: projects } = useQuery({ ...whiskersProjectsQuery(), retry: false })
  const project = projects?.find((candidate) => candidate.id === issue.projectId)
  const banner = statusBanner(issue, new Date())
  const isOpen = issue.status === 'unresolved'

  return (
    <header className="flex shrink-0 flex-col gap-3 border-border border-b px-8 pt-5 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-2 text-[12px] text-muted-foreground">
          <span className="truncate">{project?.name ?? 'Sample project'}</span>
          <span className="text-faint">/</span>
          <span className="shrink-0 font-mono">{issue.id.slice(0, 8)}</span>
          <span className="text-faint">·</span>
          <span className="shrink-0">{issue.level}</span>
        </div>
        <IssueActions issue={issue} actions={actions} />
      </div>

      <div className="flex gap-3">
        <LevelRule level={issue.level} isMuted={!isOpen} />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="m-0 font-semibold text-[20px] leading-7 tracking-[-0.015em] text-pretty">
            {issue.title}
          </h2>
          {issue.culprit && (
            <span className="truncate font-mono text-[12px] text-muted-foreground">
              {issue.culprit}
            </span>
          )}
          <IssueBadges issue={issue} className="mt-1" />
        </div>
      </div>

      {banner && (
        <IssueBanner
          banner={banner}
          actionLabel={
            isOpen ? 'Resolve again' : issue.status === 'archived' ? 'Unarchive' : 'Unresolve'
          }
          onAction={isOpen ? () => actions.resolve('now') : actions.unresolve}
        />
      )}
    </header>
  )
}
