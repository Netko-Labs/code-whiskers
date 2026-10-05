import { Button } from '@code-whiskers/ui/components/button'
import { Field, FieldDescription, FieldLabel } from '@code-whiskers/ui/components/field'
import { Input } from '@code-whiskers/ui/components/input'
import { NativeSelect, NativeSelectOption } from '@code-whiskers/ui/components/native-select'
import { PlatformGrid } from '../../shared/project-setup'
import { type SetupPlatformStepProps, useProjectDraft } from './lib'

export function SetupPlatformStep({
  platform,
  project,
  onPlatform,
  onCreated,
  onContinue,
}: SetupPlatformStepProps) {
  const draft = useProjectDraft(onCreated)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="m-0 font-semibold text-[20px] tracking-[-0.015em]">Choose a platform</h1>
        <p className="m-0 text-[13px] text-muted-foreground">
          It picks the snippets. Any Sentry SDK works, so the project itself is the same either way.
        </p>
      </header>
      <PlatformGrid value={platform} onChange={onPlatform} />
      {project ? (
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={onContinue}>
            Continue with {project.name}
          </Button>
        </div>
      ) : (
        <form
          className="flex max-w-[520px] flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            draft.create()
          }}
        >
          <Field>
            <FieldLabel htmlFor="project-name">Project name</FieldLabel>
            <Input
              id="project-name"
              value={draft.name}
              placeholder="web-frontend"
              onChange={(event) => draft.setName(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="project-repository">Repository</FieldLabel>
            <NativeSelect
              id="project-repository"
              value={draft.repository}
              onChange={(event) => draft.setRepository(event.target.value)}
            >
              {draft.options.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldDescription>
              Optional. Its errors, logs and traces then show up under that repository.
            </FieldDescription>
          </Field>
          {draft.error && (
            <span className="text-[13px] text-severity-error-ink">{draft.error}</span>
          )}
          <Button
            type="submit"
            size="sm"
            className="self-start"
            disabled={!draft.name.trim() || draft.isPending}
          >
            {draft.isPending ? 'Creating…' : 'Create project'}
          </Button>
        </form>
      )}
    </div>
  )
}
