import { CopyButton, SettingsPage } from '../shared/settings-ui'
import { ApiKeyCreate } from './api-key-create'
import { ApiKeyList } from './api-key-list'
import { ApiKeySecretDialog } from './api-key-secret-dialog'
import { curlExample, useApiKeyCreate, useApiKeyRevoke, useApiKeys } from './lib'

export function SettingsApiKeys() {
  const keys = useApiKeys()
  const form = useApiKeyCreate()
  const { revoke } = useApiKeyRevoke()
  const example = curlExample(typeof window === 'undefined' ? '' : window.location.origin)

  return (
    <SettingsPage
      title="API keys"
      description="Read access to /v1 for scripts and CI. A key is shown once and stored only as a hash; revoking takes effect on the next request."
    >
      <ApiKeyCreate form={form} />
      <ApiKeyList keys={keys} onRevoke={revoke} />
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-subtle py-1 pr-1 pl-3">
        <code className="min-w-0 flex-1 truncate font-mono text-2xs text-muted-foreground">
          {example}
        </code>
        <CopyButton value={example} label="Command" />
      </div>
      <ApiKeySecretDialog secret={form.secret} onClose={form.dismissSecret} />
    </SettingsPage>
  )
}
