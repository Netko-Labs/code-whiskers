import { Skeleton } from '@code-whiskers/ui/components/skeleton'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { whiskersSuspectCommitsQuery } from '@/integrations/whiskers'
import { shortRelease } from '../issue-lifecycle'
import { CommitRow } from './commit-row'
import { COMMIT_LINK, COMMIT_STATUS_NOTES, type SuspectCommitsProps } from './lib'
import { ReleaseNote } from './release-note'

/** Commits of the issue's first release that changed a file its stack runs through. */
export function SuspectCommits({ issueId, projectId }: SuspectCommitsProps) {
  const { data, isPending, isError } = useQuery({
    ...whiskersSuspectCommitsQuery(issueId),
    retry: false,
  })

  return (
    <section className="flex flex-col gap-1" aria-label="Suspect commits">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="m-0 font-semibold text-[13px]">Suspect commits</h3>
        {data?.version && (
          <Link
            to="/console/releases/$version"
            params={{ version: data.version }}
            search={{ project: projectId }}
            className={`${COMMIT_LINK} font-mono text-2xs text-muted-foreground`}
          >
            {shortRelease(data.version)}
          </Link>
        )}
      </div>
      {isPending && <Skeleton className="h-10 w-full" />}
      {isError && <ReleaseNote>Could not read the release's commits.</ReleaseNote>}
      {data && !data.version && (
        <ReleaseNote>Its events carry no release; set release in Sentry.init.</ReleaseNote>
      )}
      {data?.commits.map((commit) => (
        <div key={commit.sha} className="animate-enter-up border-rule-soft border-b last:border-0">
          <CommitRow commit={commit} repository={data.repository}>
            <span className="truncate font-mono text-faint" title={commit.matchedFiles.join('\n')}>
              touched {commit.matchedFiles[0]?.split('/').at(-1)}
              {commit.matchedFiles.length > 1 && ` +${commit.matchedFiles.length - 1}`}
            </span>
          </CommitRow>
        </div>
      ))}
      {data?.version && data.commits.length === 0 && (
        <ReleaseNote>
          {data.commitStatus && data.commitStatus !== 'synced'
            ? COMMIT_STATUS_NOTES[data.commitStatus]
            : `No commit in ${shortRelease(data.version)} touched its stack.`}
        </ReleaseNote>
      )}
    </section>
  )
}
