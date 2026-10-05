import { Button } from '@code-whiskers/ui/components/button'
import { Skeleton } from '@code-whiskers/ui/components/skeleton'
import { IconRefresh } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Panel, SettingRow } from '@/components/shared/page'
import { StatusBadge } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { ExternalLink } from '../shared/settings-ui'
import { type GithubAppPanelProps, useGithubSyncNow } from './lib'

/** The App this instance runs as, what it can see, and a way to look again right now. */
export function GithubAppPanel({ connection }: GithubAppPanelProps) {
  const { sync, isPending } = useGithubSyncNow()
  const isInstalled = connection.installations.length > 0

  return (
    <Panel
      title="GitHub App"
      description="Reviews, members and repositories all come through it"
      isFlush
    >
      <SettingRow label="App" description="Set by GITHUB_APP_SLUG; each instance runs its own">
        {connection.app ? (
          <ExternalLink href={connection.app.url} className="font-mono text-xs">
            {connection.app.slug}
          </ExternalLink>
        ) : (
          <Skeleton className="h-4 w-32" />
        )}
      </SettingRow>
      <SettingRow
        label="Status"
        description="Installed means at least one account granted it access"
      >
        <StatusBadge tone={isInstalled ? 'resolved' : 'warning'}>
          {isInstalled
            ? `Installed on ${connection.installations.length} account${connection.installations.length === 1 ? '' : 's'}`
            : 'Not installed'}
        </StatusBadge>
      </SettingRow>
      <SettingRow
        label="Repositories"
        description="Synced from every installation; the reviewer reads the watched ones"
      >
        <Link
          to="/console/repositories"
          className="focus-ring rounded-sm font-mono text-xs tabular-nums hover:underline"
        >
          {connection.repositories} synced · {connection.watched} watched
        </Link>
      </SettingRow>
      <SettingRow
        label="Last sync"
        description="Runs each time someone opens the console; sync now after changing access on GitHub"
      >
        <span className="font-mono text-2xs text-muted-foreground">
          {connection.lastSyncedAt ? `${formatAge(connection.lastSyncedAt)} ago` : 'never'}
        </span>
        <Button size="sm" variant="outline" disabled={isPending} onClick={sync}>
          <IconRefresh className={isPending ? 'animate-spin' : undefined} stroke={1.75} />
          {isPending ? 'Syncing…' : 'Sync now'}
        </Button>
      </SettingRow>
    </Panel>
  )
}
