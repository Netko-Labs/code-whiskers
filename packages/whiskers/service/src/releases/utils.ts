import { COMMIT_SHA_PATTERN, type Release } from '@code-whiskers/whiskers-domain'
import { SUSPECT_MIN_SEGMENTS, SYNC_RETRY_MS } from './constants'
import type {
  CommitFiles,
  CommitStatus,
  CommitTarget,
  EnvironmentCandidate,
  ReleaseCurrentKey,
  ReleaseRef,
  ResolvedWindow,
  SuspectMatch,
} from './types'

/** A version like `web@4f2a9c1` or `4f2a9c1e…` names its commit; anything else names none. */
export function shaInVersion(version: string): string | null {
  const tail = version.slice(version.lastIndexOf('@') + 1)
  return COMMIT_SHA_PATTERN.test(tail) ? tail.toLowerCase() : null
}

export function commitTargetOf(
  release: ReleaseRef,
  projectRepository: string | null,
): CommitTarget {
  return {
    repository: release.repository ?? projectRepository,
    sha: release.commitSha?.toLowerCase() ?? shaInVersion(release.version),
  }
}

export function commitStatusOf(
  release: Pick<Release, 'commitsSyncedAt'>,
  target: CommitTarget,
  lastFailedAt: number | undefined,
  now: number,
): CommitStatus {
  if (release.commitsSyncedAt) return 'synced'
  if (!target.repository) return 'no-repository'
  if (!target.sha) return 'no-commit'
  return lastFailedAt !== undefined && now - lastFailedAt < SYNC_RETRY_MS ? 'failed' : 'pending'
}

export const pairKey = (projectId: string, value: string): string => `${projectId}\u0000${value}`

/** Squash merges end the subject with `(#123)`; merge commits say `Merge pull request #123`. */
export function prNumberFromMessage(message: string): number | null {
  const subject = message.split('\n', 1)[0] ?? ''
  const match = subject.match(/\(#(\d+)\)\s*$/) ?? subject.match(/^Merge pull request #(\d+)\b/)
  return match?.[1] ? Number(match[1]) : null
}

/** `app:///src/a.ts`, `webpack://app/./src/a.ts`, `/srv/app/src/a.ts` → path segments. */
export function pathSegments(file: string): string[] {
  return file
    .replace(/^[a-z][\w+.-]*:\/\/\/?/i, '')
    .replace(/[?#].*$/, '')
    .split(/[\\/]/)
    .filter((segment) => segment !== '' && segment !== '.' && segment !== '~')
}

/** Same file when the trailing segments agree — a frame is absolute or bundled, a diff is relative. */
export function isSameFile(framePath: string, changedFile: string): boolean {
  const frame = pathSegments(framePath)
  const changed = pathSegments(changedFile)
  const needed = Math.min(SUSPECT_MIN_SEGMENTS, frame.length, changed.length)
  if (needed === 0) return false
  let shared = 0
  while (
    shared < frame.length &&
    shared < changed.length &&
    frame[frame.length - 1 - shared] === changed[changed.length - 1 - shared]
  ) {
    shared += 1
  }
  return shared >= needed
}

/** Commits that touched a file the stack runs through, most files matched first. */
export function suspectMatchesOf(commits: CommitFiles[], framePaths: string[]): SuspectMatch[] {
  const frames = [...new Set(framePaths)]
  return commits
    .map((commit) => ({
      sha: commit.sha,
      matchedFiles: commit.files.filter((file) => frames.some((frame) => isSameFile(frame, file))),
    }))
    .filter((match) => match.matchedFiles.length > 0)
    .sort((a, b) => b.matchedFiles.length - a.matchedFiles.length)
}

/**
 * The release each environment runs now: its newest deploy when it has any, else the newest
 * release whose events came from it.
 */
export function currentReleases(
  candidates: EnvironmentCandidate[],
  deployed: ReleaseCurrentKey[],
): Map<string, string> {
  const current = new Map<string, string>()
  const newestFirst = [...candidates].sort((a, b) => b.firstSeen.getTime() - a.firstSeen.getTime())
  for (const release of newestFirst) {
    for (const environment of release.environments) {
      const key = pairKey(release.projectId, environment)
      if (!current.has(key)) current.set(key, release.id)
    }
  }
  for (const deploy of deployed) {
    current.set(pairKey(deploy.projectId, deploy.environment), deploy.releaseId)
  }
  return current
}

/**
 * Which resolve decisions this release carries. Resolve-in-next-release ships in the first release
 * seen after the decision; resolve-now lands in the release that was newest when it was made.
 */
export function resolvedWindowOf(
  previousFirstSeen: Date | null,
  firstSeen: Date,
  nextFirstSeen: Date | null,
): ResolvedWindow {
  return {
    nextFrom: previousFirstSeen,
    nextUntil: firstSeen,
    nowFrom: firstSeen,
    nowUntil: nextFirstSeen,
  }
}

/** Bounded parallelism over GitHub calls; results keep the input order. */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  run: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const index = next
      next += 1
      results[index] = await run(items[index] as T)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}
