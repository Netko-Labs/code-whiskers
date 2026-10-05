import { Button } from '@code-whiskers/ui/components/button'
import { Input } from '@code-whiskers/ui/components/input'
import { IconLock } from '@tabler/icons-react'
import { Panel } from '@/components/shared/page'
import type { ApiKeyCreateProps } from './lib'

/** Vercel's inline create: name it, see the one scope it gets, create. */
export function ApiKeyCreate({ form }: ApiKeyCreateProps) {
  return (
    <Panel
      title="Create a key"
      description="It reads everything you can read through /v1, and nothing more. Name it after where it will live."
    >
      <form
        noValidate
        className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-start"
        onSubmit={(event) => {
          event.preventDefault()
          form.submit()
        }}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="api-key-name" className="sr-only">
            Key name
          </label>
          <Input
            id="api-key-name"
            value={form.name}
            placeholder="release-dashboard CI"
            autoComplete="off"
            aria-invalid={form.error ? true : undefined}
            aria-describedby={form.error ? 'api-key-name-error' : undefined}
            onChange={(event) => form.setName(event.target.value)}
            className="h-8"
          />
          {form.error && (
            <p
              id="api-key-name-error"
              role="alert"
              className="m-0 animate-enter text-2xs text-severity-error-ink"
            >
              {form.error}
            </p>
          )}
        </div>
        <span className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface-subtle px-2.5 text-2xs text-muted-foreground">
          <IconLock className="size-3.5" stroke={1.75} />
          Read-only · /v1
        </span>
        <Button type="submit" size="sm" className="h-8" disabled={form.isPending}>
          {form.isPending ? 'Creating…' : 'Create key'}
        </Button>
      </form>
    </Panel>
  )
}
