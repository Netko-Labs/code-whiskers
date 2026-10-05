import { Button } from '@code-whiskers/ui/components/button'
import { Field, FieldLabel } from '@code-whiskers/ui/components/field'
import { Input } from '@code-whiskers/ui/components/input'
import { NativeSelect, NativeSelectOption } from '@code-whiskers/ui/components/native-select'
import { type ProjectSectionProps, useProjectGeneral } from './lib'
import { SettingsSection } from './settings-section'

export function ProjectGeneral({ project }: ProjectSectionProps) {
  const form = useProjectGeneral(project)

  return (
    <SettingsSection
      title="General"
      description="The name shows in Issues; the repository scopes it."
    >
      <form
        className="grid max-w-[640px] gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          form.save()
        }}
      >
        <Field>
          <FieldLabel htmlFor="settings-name">Name</FieldLabel>
          <Input
            id="settings-name"
            value={form.name}
            onChange={(event) => form.setName(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="settings-repository">Repository</FieldLabel>
          <NativeSelect
            id="settings-repository"
            value={form.repository}
            onChange={(event) => form.setRepository(event.target.value)}
          >
            {form.options.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Button
          type="submit"
          size="sm"
          className="self-start"
          disabled={!form.isDirty || !form.name.trim() || form.isPending}
        >
          {form.isPending ? 'Saving…' : 'Save'}
        </Button>
      </form>
    </SettingsSection>
  )
}
