import { Button } from '@code-whiskers/ui/components/button'
import { Field, FieldLabel } from '@code-whiskers/ui/components/field'
import { Input } from '@code-whiskers/ui/components/input'
import { type ProjectSectionProps, useProjectDeletion } from './lib'
import { SettingsSection } from './settings-section'

export function ProjectDangerZone({ project }: ProjectSectionProps) {
  const deletion = useProjectDeletion(project)

  return (
    <SettingsSection
      title="Delete project"
      description="Its keys stop working at once; its issues, events, logs and spans are deleted, with their triage history."
      tone="danger"
    >
      <form
        className="flex max-w-[420px] flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          deletion.remove()
        }}
      >
        <Field>
          <FieldLabel htmlFor="delete-confirmation">
            Type <span className="font-mono">{project.name}</span> to confirm
          </FieldLabel>
          <Input
            id="delete-confirmation"
            autoComplete="off"
            value={deletion.confirmation}
            onChange={(event) => deletion.setConfirmation(event.target.value)}
          />
        </Field>
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          className="self-start"
          disabled={!deletion.canDelete}
        >
          {deletion.isPending ? 'Deleting…' : 'Delete project'}
        </Button>
      </form>
    </SettingsSection>
  )
}
