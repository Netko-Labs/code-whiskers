import { Button, buttonVariants } from '@code-whiskers/ui/components/button'
import { IconArrowUpRight, IconGitBranch, IconRefresh } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { PageHeader } from '@/components/shared/page'
import { SeverityDot } from '@/components/shared/status'
import { pullRequestUrl, pullRequestVerdict, shortSha } from '../shared/review-model'
import { VerdictBadge } from '../shared/verdict-badge'
import type { ReviewHeaderProps } from './lib'

export function ReviewHeader({ data, actions }: ReviewHeaderProps) {
  const { selected, latest, slug } = data
  const isLatest = selected.id === latest.id
  const isRunning = latest.status === 'pending' || latest.status === 'running'

  return (
    <>
      <PageHeader
        title={latest.title ?? `Pull request #${latest.prNumber}`}
        meta={
          <>
            <span className="font-mono">{slug}</span>
            <span className="font-mono text-foreground">#{latest.prNumber}</span>
            {latest.headRef && (
              <span className="inline-flex items-center gap-1 font-mono">
                <IconGitBranch className="size-3" stroke={1.75} />
                {latest.headRef}
              </span>
            )}
            <span className="font-mono">{shortSha(selected.headSha)}</span>
            {latest.author && <span>by {latest.author}</span>}
            <VerdictBadge verdict={pullRequestVerdict(selected)} />
          </>
        }
        actions={
          <>
            <Button size="sm" variant="outline" onClick={actions.rerun} disabled={isRunning}>
              <IconRefresh stroke={1.75} />
              {isRunning ? 'Reviewing…' : 'Run again'}
            </Button>
            <a
              href={pullRequestUrl(slug, latest.prNumber)}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: 'sm' })}
            >
              Open on GitHub
              <IconArrowUpRight stroke={1.75} />
            </a>
          </>
        }
      />
      {!isLatest && (
        <div className="mx-gutter flex animate-enter items-center gap-2 rounded-lg border border-border bg-surface-subtle px-3 py-2 text-muted-foreground text-ui">
          <SeverityDot tone="info" size="sm" />
          <span className="min-w-0 flex-1">
            Reading an older push, <span className="font-mono">{shortSha(selected.headSha)}</span>.
          </span>
          <Link
            to="/console/reviews/$reviewId"
            params={{ reviewId: latest.id }}
            className="focus-ring shrink-0 rounded-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Newest push <span className="font-mono">{shortSha(latest.headSha)}</span>
          </Link>
        </div>
      )}
    </>
  )
}
