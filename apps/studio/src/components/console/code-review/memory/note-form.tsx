import { Button } from '@code-whiskers/ui/components/button'
import { DialogFooter } from '@code-whiskers/ui/components/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@code-whiskers/ui/components/field'
import { Input } from '@code-whiskers/ui/components/input'
import { NativeSelect, NativeSelectOption } from '@code-whiskers/ui/components/native-select'
import { Textarea } from '@code-whiskers/ui/components/textarea'
import { KindPicker } from './kind-picker'
import { EXAMPLE_NOTE, type NoteFormProps, useNoteForm, WHOLE_INSTALLATION } from './lib'

export function NoteForm({ initial, organizations, repositories, onDone }: NoteFormProps) {
  const form = useNoteForm(initial)
  const { draft } = form
  const isPickingInstallation = !draft.id && organizations.length > 1
  const organization = organizations.find(
    (org) => String(org.installationId) === draft.installationId,
  )
  const inInstallation = repositories.filter(
    (repo) => String(repo.installationId) === draft.installationId,
  )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void form.submit().then((isSaved) => isSaved && onDone())
      }}
      className="flex flex-col gap-5"
    >
      <FieldGroup>
        <Field>
          <FieldLabel id="note-kind">What kind of note</FieldLabel>
          <KindPicker value={draft.kind} onChange={(kind) => form.update({ kind })} />
        </Field>
        <Field>
          <FieldLabel htmlFor="note-body">Note</FieldLabel>
          <Textarea
            id="note-body"
            autoFocus
            rows={3}
            value={draft.body}
            placeholder={EXAMPLE_NOTE.body}
            onChange={(event) => form.update({ body: event.target.value })}
          />
          <FieldDescription>
            A sentence or two, the way you would tell a new teammate.
          </FieldDescription>
        </Field>
        {isPickingInstallation && (
          <Field>
            <FieldLabel htmlFor="note-installation">Organization</FieldLabel>
            <NativeSelect
              id="note-installation"
              value={draft.installationId}
              onChange={(event) =>
                form.update({
                  installationId: event.target.value,
                  repositoryId: WHOLE_INSTALLATION,
                })
              }
            >
              {organizations.map((org) => (
                <NativeSelectOption key={org.installationId} value={String(org.installationId)}>
                  {org.name ?? org.login}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="note-repository">Applies to</FieldLabel>
          <NativeSelect
            id="note-repository"
            value={draft.repositoryId}
            onChange={(event) => form.update({ repositoryId: event.target.value })}
          >
            <NativeSelectOption value={WHOLE_INSTALLATION}>
              Every repository in {organization?.login ?? 'the organization'}
            </NativeSelectOption>
            {inInstallation.map((repo) => (
              <NativeSelectOption key={repo.id} value={String(repo.id)}>
                {repo.owner}/{repo.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="note-paths">Only in these folders (optional)</FieldLabel>
          <Input
            id="note-paths"
            value={draft.paths}
            className="font-mono"
            placeholder={EXAMPLE_NOTE.paths}
            onChange={(event) => form.update({ paths: event.target.value })}
          />
          <FieldDescription>
            Leave empty for every file. Separate several with commas;{' '}
            <code className="font-mono">**</code> matches any depth.
          </FieldDescription>
        </Field>
        {form.error && (
          <p role="alert" className="m-0 animate-enter text-severity-error-ink text-ui">
            {form.error}
          </p>
        )}
      </FieldGroup>
      <DialogFooter>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={form.isSaving}>
          {form.isSaving ? 'Saving…' : draft.id ? 'Save changes' : 'Save note'}
        </Button>
      </DialogFooter>
    </form>
  )
}
