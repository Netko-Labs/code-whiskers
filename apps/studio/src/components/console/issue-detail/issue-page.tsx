import { IconArrowLeft } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { IssueDetail } from './issue-detail'
import type { IssuePageProps } from './lib'

/** The issue on its own page, reached from the Issues list. */
export function IssuePage({ issueId }: IssuePageProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <nav className="flex shrink-0 items-center border-border border-b px-8 py-2.5">
        <Link
          to="/console/$section"
          params={{ section: 'issues' }}
          search={{ tab: 0 }}
          className="flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-3.5" stroke={1.75} />
          Issues
        </Link>
      </nav>
      <IssueDetail key={issueId} issueId={issueId} />
    </div>
  )
}
