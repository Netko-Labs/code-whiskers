import { Button } from '@code-whiskers/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@code-whiskers/ui/components/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@code-whiskers/ui/components/field'
import { Input } from '@code-whiskers/ui/components/input'
import { NativeSelect, NativeSelectOption } from '@code-whiskers/ui/components/native-select'
import { Textarea } from '@code-whiskers/ui/components/textarea'
import { useConsoleStore } from '../use-console-store'
import { type SectionFormDialogProps, useSectionForm } from './lib'

export function SectionFormDialog({ form, isOpen, onOpenChange }: SectionFormDialogProps) {
  const state = useSectionForm(form)

  function close(next: boolean) {
    if (!next) state.reset()
    onOpenChange(next)
  }

  async function submit() {
    const isDone = await state.submit()
    if (!isDone) return
    close(false)
  }

  const reveal = state.result?.reveal

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{form.title}</DialogTitle>
          {form.description && <DialogDescription>{form.description}</DialogDescription>}
        </DialogHeader>

        {reveal ? (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] text-body">{state.result?.message}</span>
            <code className="break-all rounded-lg bg-surface-subtle px-3 py-2 font-mono text-xs">
              {reveal}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void navigator.clipboard.writeText(reveal)
                useConsoleStore.getState().flash('Copied to the clipboard')
              }}
            >
              Copy
            </Button>
          </div>
        ) : (
          <FieldGroup>
            {form.fields.map((field) => (
              <Field key={field.name}>
                <FieldLabel htmlFor={`field-${field.name}`}>{field.label}</FieldLabel>
                {field.kind === 'textarea' ? (
                  <Textarea
                    id={`field-${field.name}`}
                    value={state.values[field.name] ?? ''}
                    placeholder={field.placeholder}
                    onChange={(event) => state.setValue(field.name, event.target.value)}
                  />
                ) : field.kind === 'select' ? (
                  <NativeSelect
                    id={`field-${field.name}`}
                    value={state.values[field.name] ?? ''}
                    onChange={(event) => state.setValue(field.name, event.target.value)}
                  >
                    {field.options?.map((option) => (
                      <NativeSelectOption key={option.value} value={option.value}>
                        {option.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                ) : (
                  <Input
                    id={`field-${field.name}`}
                    value={state.values[field.name] ?? ''}
                    placeholder={field.placeholder}
                    onChange={(event) => state.setValue(field.name, event.target.value)}
                  />
                )}
                {field.hint && <FieldDescription>{field.hint}</FieldDescription>}
              </Field>
            ))}
            {state.error && (
              <span className="text-[13px] text-severity-error-ink">{state.error}</span>
            )}
          </FieldGroup>
        )}

        <DialogFooter>
          {reveal ? (
            <Button size="sm" onClick={() => close(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => void submit()} disabled={state.isPending}>
                {state.isPending ? 'Saving…' : form.submitLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
