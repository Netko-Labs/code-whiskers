import { formatAge } from '@/shared/format-date'
import { CommitAuthor } from './commit-author'
import {
  COMMIT_LINK,
  type CommitRowProps,
  commitSubject,
  commitUrl,
  pullUrl,
  shortSha,
} from './lib'
import { ReviewVerdictChip } from './review-verdict-chip'

/** Sha, subject, author, and the pull request it came from with the reviewer's verdict. */
export function CommitRow({ commit, repository, children }: CommitRowProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1 py-2.5">
      <div className="flex min-w-0 items-baseline gap-2">
        {repository ? (
          <a
            href={commitUrl(repository, commit.sha)}
            target="_blank"
            rel="noreferrer"
            className={`${COMMIT_LINK} shrink-0 font-mono text-2xs text-muted-foreground`}
          >
            {shortSha(commit.sha)}
          </a>
        ) : (
          <span className="shrink-0 font-mono text-2xs text-muted-foreground">
            {shortSha(commit.sha)}
          </span>
        )}
        <span className="min-w-0 truncate text-foreground text-ui" title={commit.message}>
          {commitSubject(commit.message)}
        </span>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-2xs">
        <CommitAuthor
          name={commit.authorName}
          login={commit.authorLogin}
          avatar={commit.authorAvatar}
        />
        <span className="font-mono text-faint tabular-nums">
          {formatAge(commit.committedAt)} ago
        </span>
        {commit.prNumber !== null && repository && (
          <a
            href={pullUrl(repository, commit.prNumber)}
            target="_blank"
            rel="noreferrer"
            className={`${COMMIT_LINK} font-mono text-muted-foreground`}
          >
            #{commit.prNumber}
          </a>
        )}
        {commit.review && <ReviewVerdictChip review={commit.review} />}
        {children}
      </div>
    </div>
  )
}
