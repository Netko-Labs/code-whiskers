import { DataRow, DataRowMeta, DataRowTitle, DataRowTrail } from '@/components/shared/data-list'
import { formatAge } from '@/shared/format-date'
import { PersonAvatar } from '../../shared/console-ui'
import { installationSettingsUrl } from '../lib'
import { ExternalLink } from '../shared/settings-ui'
import type { InstallationRowProps } from './lib'

export function InstallationRow({ installation }: InstallationRowProps) {
  const { org } = installation

  return (
    <DataRow density="auto" className="px-4">
      <PersonAvatar
        name={org.name ?? org.login}
        image={org.avatarUrl}
        className="size-7 rounded-md text-2xs"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <DataRowTitle className="font-mono text-xs">{org.login}</DataRowTitle>
        <span className="truncate text-2xs text-muted-foreground">
          {org.accountType === 'Organization' ? 'Organization' : 'Personal account'} · synced{' '}
          {formatAge(org.syncedAt)} ago
        </span>
      </span>
      <DataRowTrail className="gap-4">
        <DataRowMeta>
          {installation.repositories} repos · {installation.watched} watched
        </DataRowMeta>
        <ExternalLink href={installationSettingsUrl(org)} className="text-2xs">
          Configure
        </ExternalLink>
      </DataRowTrail>
    </DataRow>
  )
}
