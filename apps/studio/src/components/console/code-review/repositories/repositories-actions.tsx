import { Button, buttonVariants } from '@code-whiskers/ui/components/button'
import { Spinner } from '@code-whiskers/ui/components/spinner'
import { IconBrandGithub, IconRefresh } from '@tabler/icons-react'
import { type RepositoriesActionsProps, useGithubSyncAction } from './lib'

export function RepositoriesActions({ installUrl }: RepositoriesActionsProps) {
  const { sync, isSyncing } = useGithubSyncAction()

  return (
    <>
      <Button size="sm" variant="outline" onClick={sync} disabled={isSyncing}>
        {isSyncing ? <Spinner /> : <IconRefresh stroke={1.75} />}
        {isSyncing ? 'Syncing…' : 'Sync from GitHub'}
      </Button>
      {installUrl && (
        <a
          href={installUrl}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ size: 'sm' })}
        >
          <IconBrandGithub stroke={1.75} />
          Add repositories
        </a>
      )}
    </>
  )
}
