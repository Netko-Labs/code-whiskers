import { Panel } from '@/components/shared/page'
import { TONE_INK } from '@/components/shared/status'
import { shortRelease } from '../../shared/issue-lifecycle'
import { COMMIT_STATUS_NOTES, CommitRow, ReleaseNote } from '../../shared/release-ui'
import type { ReleaseSectionProps } from './lib'

/** What went into the release since the previous one, each commit with its PR and review. */
export function ReleaseCommits({ detail }: ReleaseSectionProps) {
  const { commits, commitStatus, previousVersion, release, repository } = detail
  const range = previousVersion
    ? `Since ${shortRelease(previousVersion)}`
    : 'The commit this release was built from'

  return (
    <Panel title="Commits" description={commits.length > 0 ? range : undefined}>
      {commits.length === 0 ? (
        <ReleaseNote>
          {commitStatus === 'synced'
            ? `No new commits in ${shortRelease(release.version)}.`
            : COMMIT_STATUS_NOTES[commitStatus]}
        </ReleaseNote>
      ) : (
        <div className="stagger -my-2.5 flex flex-col">
          {commits.map((commit) => (
            <div key={commit.sha} className="border-rule-soft border-b last:border-0">
              <CommitRow commit={commit} repository={repository}>
                {commit.suspectIssueIds.length > 0 && (
                  <span className={`font-medium ${TONE_INK.error}`}>
                    Suspect for {commit.suspectIssueIds.length} new{' '}
                    {commit.suspectIssueIds.length === 1 ? 'issue' : 'issues'}
                  </span>
                )}
              </CommitRow>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}
