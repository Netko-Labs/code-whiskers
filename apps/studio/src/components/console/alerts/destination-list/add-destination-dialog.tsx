import { Button } from '@code-whiskers/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@code-whiskers/ui/components/dialog'
import { Field, FieldDescription, FieldLabel } from '@code-whiskers/ui/components/field'
import { Input } from '@code-whiskers/ui/components/input'
import { NativeSelect, NativeSelectOption } from '@code-whiskers/ui/components/native-select'
import { DestinationIcon } from '../shared/destination-icon'
import { Segmented } from '../shared/segmented'
import { type AddDestinationDialogProps, DESTINATION_KINDS, useAddDestination } from './lib'

export function AddDestinationDialog({
  installations,
  isOpen,
  onOpenChange,
}: AddDestinationDialogProps) {
  const form = useAddDestination(String(installations[0]?.installationId ?? ''), () =>
    onOpenChange(false),
  )
  const kind =
    DESTINATION_KINDS.find((option) => option.value === form.kind) ?? DESTINATION_KINDS[0]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a destination</DialogTitle>
          <DialogDescription>
            The URL is a credential: studio encrypts it and never shows it again.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (form.canSubmit) form.submit()
          }}
        >
          <Segmented
            label="Kind"
            value={form.kind}
            onChange={form.setKind}
            options={DESTINATION_KINDS.map((option) => ({
              value: option.value,
              label: option.label,
              icon: <DestinationIcon kind={option.value} className="text-current" />,
            }))}
          />
          <Field>
            <FieldLabel htmlFor="destination-name">Name</FieldLabel>
            <Input
              id="destination-name"
              value={form.name}
              placeholder="#oncall-platform"
              onChange={(event) => form.setName(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="destination-url">Webhook URL</FieldLabel>
            <Input
              id="destination-url"
              value={form.url}
              placeholder={kind?.placeholder}
              className="font-mono"
              onChange={(event) => form.setUrl(event.target.value)}
            />
            <FieldDescription>{kind?.hint}</FieldDescription>
          </Field>
          {installations.length > 1 && (
            <Field>
              <FieldLabel htmlFor="destination-installation">Installation</FieldLabel>
              <NativeSelect
                id="destination-installation"
                value={form.installationId}
                onChange={(event) => form.setInstallationId(event.target.value)}
              >
                {installations.map((org) => (
                  <NativeSelectOption key={org.installationId} value={String(org.installationId)}>
                    {org.name ?? org.login}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          )}
          {form.error && <p className="m-0 text-2xs text-severity-error-ink">{form.error}</p>}
          <DialogFooter>
            <Button type="submit" size="sm" disabled={!form.canSubmit || form.isPending}>
              {form.isPending ? 'Adding…' : 'Add destination'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
