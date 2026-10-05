import { Switch } from '@code-whiskers/ui/components/switch'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconFolder, IconLock } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { DataRow, DataRowLead, DataRowMeta, DataRowTrail } from '@/components/shared/data-list'
import { SeverityDot } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { VERDICT_META } from '../shared/review-model'
import { type RepositoryRowProps, useRepositoryActions } from './lib'

const LINK = 'focus-ring rounded-sm underline-offset-4 hover:underline'

export function RepositoryRow({ row }: RepositoryRowProps) {
  const { setWatched } = useRepositoryActions()
  const { repository, lastPullRequest } = row
  const isWatched = repository.isWatched

  return (
    <DataRow density="auto" tone={row.openBlockers > 0 && isWatched ? 'error' : 'neutral'}>
      <DataRowLead>
        {repository.isPrivate ? (
          <IconLock stroke={1.75} aria-label="Private" />
        ) : (
          <IconFolder stroke={1.75} />
        )}
      </DataRowLead>
      <span className={cn('flex min-w-0 flex-1 flex-col gap-0.5', !isWatched && 'opacity-60')}>
        <Link
          to="/console/pull-requests"
          search={{ repo: row.slug }}
          className={cn(LINK, 'min-w-0 self-start truncate font-medium font-mono')}
        >
          {repository.name}
        </Link>
        <span className="flex min-w-0 items-center gap-1.5 text-2xs text-muted-foreground">
          <span className="truncate">{repository.language ?? 'No language'}</span>
          <span className="text-faint">·</span>
          <span className="shrink-0">
            {row.pullRequests} {row.pullRequests === 1 ? 'pull request' : 'pull requests'}
          </span>
          {repository.pushedAt && (
            <>
              <span className="hidden text-faint sm:inline">·</span>
              <span className="hidden shrink-0 sm:inline">
                pushed {formatAge(repository.pushedAt)} ago
              </span>
            </>
          )}
        </span>
      </span>
      <DataRowTrail>
        <span className="hidden w-40 justify-end md:flex">
          {lastPullRequest ? (
            <Link
              to="/console/reviews/$reviewId"
              params={{ reviewId: lastPullRequest.latest.id }}
              title={lastPullRequest.title ?? undefined}
              className={cn(LINK, 'flex items-center gap-1.5 text-2xs text-muted-foreground')}
            >
              <SeverityDot
                tone={VERDICT_META[lastPullRequest.verdict].tone}
                isPulsing={lastPullRequest.verdict === 'running'}
                size="sm"
              />
              <span className="font-mono">#{lastPullRequest.prNumber}</span>
              <span>{formatAge(lastPullRequest.lastActivity)} ago</span>
            </Link>
          ) : (
            <span className="text-2xs text-faint">Not reviewed yet</span>
          )}
        </span>
        <DataRowMeta
          className={cn(
            'hidden w-20 text-right sm:block',
            row.openBlockers > 0 && 'text-severity-error-ink',
          )}
        >
          {row.openBlockers > 0
            ? `${row.openBlockers} ${row.openBlockers === 1 ? 'blocker' : 'blockers'}`
            : '—'}
        </DataRowMeta>
        <DataRowMeta className="hidden w-20 text-right lg:block">
          {row.reviews} {row.reviews === 1 ? 'review' : 'reviews'}
        </DataRowMeta>
        <span className="flex w-24 items-center justify-end gap-2">
          <span className="text-2xs text-muted-foreground">{isWatched ? 'Watched' : 'Paused'}</span>
          <Switch
            size="sm"
            checked={isWatched}
            onCheckedChange={(next) => setWatched(repository, next)}
            aria-label={`Review pull requests in ${row.slug}`}
          />
        </span>
      </DataRowTrail>
    </DataRow>
  )
}
