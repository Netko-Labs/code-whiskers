import { buttonVariants } from '@code-whiskers/ui/components/button'
import { DataList, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/page'
import { SettingsPage } from '../shared/settings-ui'
import { GithubAppPanel } from './github-app-panel'
import { InstallationRow } from './installation-row'
import { useGithubConnection } from './lib'

export function SettingsGithub() {
  const connection = useGithubConnection()
  const installUrl = connection.app?.installUrl
  const installButton = installUrl && (
    <a
      href={installUrl}
      target="_blank"
      rel="noreferrer"
      className={buttonVariants({ size: 'sm', variant: 'outline' })}
    >
      Install on another account
    </a>
  )

  return (
    <SettingsPage
      title="GitHub"
      description="CodeWhiskers sees what its GitHub App is installed on. Access, repositories and members all follow the installations."
    >
      <GithubAppPanel connection={connection} />
      {connection.isError ? (
        <ErrorState size="inline" onRetry={connection.retry} />
      ) : connection.isLoading ? (
        <Panel isFlush>
          <DataListSkeleton rows={2} />
        </Panel>
      ) : connection.installations.length === 0 ? (
        <EmptyState
          size="inline"
          title="Not installed anywhere yet"
          description="Install the App on an organization or your account; its repositories appear here and pull requests start getting reviewed."
          action={
            installUrl && (
              <a
                href={installUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ size: 'sm' })}
              >
                Install the GitHub App
              </a>
            )
          }
        />
      ) : (
        <Panel title="Installations" actions={installButton} isFlush>
          <DataList label="Installations" isDivided>
            {connection.installations.map((installation) => (
              <InstallationRow key={installation.org.installationId} installation={installation} />
            ))}
          </DataList>
        </Panel>
      )}
    </SettingsPage>
  )
}
