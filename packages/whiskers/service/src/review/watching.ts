import { readFromStudio } from './studio-client'

/**
 * A paused repository is skipped. Anything studio cannot answer for — never synced, studio down,
 * no token — keeps reviewing: silence must never quietly switch reviews off.
 */
export async function isRepositoryWatched(repo: string): Promise<boolean> {
  const { value } = await readFromStudio<{ isWatched: boolean }>(
    'repository',
    { repo },
    {
      isWatched: true,
    },
  )
  return value.isWatched
}
