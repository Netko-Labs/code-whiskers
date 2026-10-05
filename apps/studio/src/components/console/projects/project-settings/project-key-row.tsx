import { Button } from '@code-whiskers/ui/components/button'
import { formatAge } from '@/shared/format-date'
import { ConsolePill } from '../../shared/console-ui'
import { consoleOrigin, DsnChip, dsnFor } from '../../shared/project-setup'
import type { ProjectKeyRowProps } from './lib'

export function ProjectKeyRow({
  projectId,
  projectKey,
  isLastEnabled,
  actions,
}: ProjectKeyRowProps) {
  const lastUsed = projectKey.lastUsedAt ? `${formatAge(projectKey.lastUsedAt)} ago` : 'never'

  return (
    <div className="grid grid-cols-[160px_minmax(0,1fr)_90px_90px_max-content] items-center gap-4 border-rule-soft border-b py-2.5">
      <span className="truncate font-medium text-[13px]">{projectKey.label}</span>
      <DsnChip dsn={dsnFor(consoleOrigin(), projectId, projectKey.publicKey)} />
      <ConsolePill tone={projectKey.isEnabled ? 'info' : 'neutral'}>
        {projectKey.isEnabled ? 'enabled' : 'disabled'}
      </ConsolePill>
      <span className="text-[12px] text-muted-foreground" title="Last event this key sent">
        {lastUsed}
      </span>
      <div className="flex gap-1.5">
        <Button
          size="xs"
          variant="outline"
          disabled={actions.isPending}
          onClick={() => actions.setEnabled(projectKey, !projectKey.isEnabled)}
        >
          {projectKey.isEnabled ? 'Disable' : 'Enable'}
        </Button>
        <Button
          size="xs"
          variant="destructive"
          disabled={actions.isPending || isLastEnabled}
          title={isLastEnabled ? 'The last enabled key cannot be deleted' : undefined}
          onClick={() => actions.remove(projectKey)}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
