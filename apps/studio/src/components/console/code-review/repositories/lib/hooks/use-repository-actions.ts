import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  type Repository,
  repositoriesQuery,
  setAgentMergeAllowed,
  setRepositoryWatched,
} from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import type { RepositoryActions } from '../types'

/** The switch flips at once; a refused write flips it back and says so. */
export function useRepositoryActions(): RepositoryActions {
  const queryClient = useQueryClient()

  return useMemo(() => {
    const { queryKey } = repositoriesQuery()
    const patch = (id: number, fields: Partial<Repository>) =>
      queryClient.setQueryData(queryKey, (repos = []) =>
        repos.map((repo) => (repo.id === id ? { ...repo, ...fields } : repo)),
      )
    const flash = (message: string) => useConsoleStore.getState().flash(message)

    return {
      setWatched: (repository: Repository, isWatched: boolean) => {
        patch(repository.id, { isWatched })
        setRepositoryWatched(repository.id, isWatched)
          .then(() =>
            flash(
              isWatched
                ? `Watching ${repository.name}; its next push is reviewed`
                : `${repository.name} paused; its pull requests are not reviewed`,
            ),
          )
          .catch((error: Error) => {
            patch(repository.id, { isWatched: !isWatched })
            flash(error.message)
          })
      },
      setAgentMerge: (repository: Repository, isAllowed: boolean) => {
        patch(repository.id, { isAgentMergeAllowed: isAllowed })
        setAgentMergeAllowed(repository.id, isAllowed)
          .then(() =>
            flash(
              isAllowed
                ? `Agents may merge ${repository.name} once it is mergeable and CI is green`
                : `A person merges ${repository.name}; agents stop at mergeable`,
            ),
          )
          .catch((error: Error) => {
            patch(repository.id, { isAgentMergeAllowed: !isAllowed })
            flash(error.message)
          })
      },
    }
  }, [queryClient])
}
