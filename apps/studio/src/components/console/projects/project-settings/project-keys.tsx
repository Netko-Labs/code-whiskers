import { Button } from '@code-whiskers/ui/components/button'
import { Input } from '@code-whiskers/ui/components/input'
import { type ProjectSectionProps, useKeyActions } from './lib'
import { ProjectKeyRow } from './project-key-row'
import { SettingsSection } from './settings-section'

export function ProjectKeys({ project }: ProjectSectionProps) {
  const actions = useKeyActions(project.id)
  const enabled = project.keys.filter((key) => key.isEnabled)

  return (
    <SettingsSection
      title="Client keys"
      description="Each key is a DSN. Any enabled key ingests; disable one to cut off whatever still uses it."
    >
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {project.keys.map((key) => (
            <ProjectKeyRow
              key={key.id}
              projectId={project.id}
              projectKey={key}
              isLastEnabled={key.isEnabled && enabled.length === 1}
              actions={actions}
            />
          ))}
        </div>
      </div>
      <form
        className="flex max-w-[420px] gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          actions.add()
        }}
      >
        <Input
          aria-label="New key label"
          placeholder="Label, e.g. staging"
          value={actions.label}
          onChange={(event) => actions.setLabel(event.target.value)}
        />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={!actions.label.trim() || actions.isPending}
        >
          Add key
        </Button>
      </form>
    </SettingsSection>
  )
}
