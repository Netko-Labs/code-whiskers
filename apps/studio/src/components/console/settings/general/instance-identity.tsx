import { Button } from '@code-whiskers/ui/components/button'
import { Input } from '@code-whiskers/ui/components/input'
import { Skeleton } from '@code-whiskers/ui/components/skeleton'
import { useQuery } from '@tanstack/react-query'
import { Panel, SettingRow } from '@/components/shared/page'
import { StatusBadge } from '@/components/shared/status'
import { instanceQuery } from '@/integrations/studio-api'
import { CopyButton } from '../shared/settings-ui'
import { useInstanceName } from './lib'

export function InstanceIdentity() {
  const { data: instance, isPending } = useQuery({ ...instanceQuery(), retry: false })
  const form = useInstanceName(instance)

  return (
    <Panel
      title="Instance"
      description="What this deployment is called and where it answers"
      isFlush
    >
      <SettingRow
        label="Name"
        htmlFor="instance-name"
        description="What your team calls this deployment"
      >
        <form
          className="flex w-full flex-col items-stretch gap-1 sm:w-auto sm:items-end"
          onSubmit={(event) => {
            event.preventDefault()
            form.save()
          }}
        >
          <div className="flex items-center gap-2">
            {isPending ? (
              <Skeleton className="h-8 w-56" />
            ) : (
              <Input
                id="instance-name"
                value={form.name}
                aria-invalid={form.error ? true : undefined}
                aria-describedby={form.error ? 'instance-name-error' : undefined}
                onChange={(event) => form.setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') form.reset()
                }}
                className="h-8 w-full sm:w-56"
              />
            )}
            {form.isDirty && (
              <Button
                type="submit"
                size="sm"
                className="animate-enter-scale"
                disabled={!!form.error || form.isPending}
              >
                Save
              </Button>
            )}
          </div>
          {form.error && (
            <p
              id="instance-name-error"
              role="alert"
              className="m-0 animate-enter text-2xs text-severity-error-ink"
            >
              {form.error}
            </p>
          )}
        </form>
      </SettingRow>
      <SettingRow label="Base URL" description="Set by BASE_URL; sign-in callbacks and DSNs use it">
        {instance ? (
          <>
            <span className="truncate font-mono text-xs">{instance.baseUrl}</span>
            <CopyButton value={instance.baseUrl} label="Base URL" />
          </>
        ) : (
          <Skeleton className="h-4 w-48" />
        )}
      </SettingRow>
      <SettingRow label="Release" description="SENTRY_RELEASE, else the deployed commit">
        {instance ? (
          <>
            <span className="truncate font-mono text-xs">{instance.release}</span>
            {instance.environment && (
              <StatusBadge tone="neutral">{instance.environment}</StatusBadge>
            )}
          </>
        ) : (
          <Skeleton className="h-4 w-32" />
        )}
      </SettingRow>
    </Panel>
  )
}
