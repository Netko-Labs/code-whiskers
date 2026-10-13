import { Button } from '@code-whiskers/ui/components/button'
import { Input } from '@code-whiskers/ui/components/input'
import { NativeSelect, NativeSelectOption } from '@code-whiskers/ui/components/native-select'
import { Panel } from '@/components/shared/page'
import { type ApiKeyCreateProps, SCOPE_LABEL } from './lib'

/** Vercel's inline create: name it, pick what it may do, create. */
export function ApiKeyCreate({ form }: ApiKeyCreateProps) {
  return (
    <Panel
      title="Create a key"
      description="Read-only keys see what you can see through /v1. Review-loop keys also let a coding agent (Claude Code over MCP) reply on threads and add context to memory."
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
        <NativeSelect
          aria-label="Key scope"
          value={form.scope}
          onChange={(event) => form.setScope(event.target.value === 'loop' ? 'loop' : 'read')}
          className="h-8 text-2xs"
        >
          <NativeSelectOption value="read">{SCOPE_LABEL.read}</NativeSelectOption>
          <NativeSelectOption value="loop">{SCOPE_LABEL.loop}</NativeSelectOption>
        </NativeSelect>
        <Button type="submit" size="sm" className="h-8" disabled={form.isPending}>
          {form.isPending ? 'Creating…' : 'Create key'}
        </Button>
      </form>
    </Panel>
  )
}
