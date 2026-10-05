import { Button } from '@code-whiskers/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@code-whiskers/ui/components/dialog'
import { Field, FieldLabel } from '@code-whiskers/ui/components/field'
import { Input } from '@code-whiskers/ui/components/input'
import { Spinner } from '@code-whiskers/ui/components/spinner'
import { IconBookmark } from '@tabler/icons-react'
import { type SaveViewProps, useSaveView } from './lib'

export function SaveViewButton(props: SaveViewProps) {
  const view = useSaveView(props)

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => view.setOpen(true)}>
        <IconBookmark className="size-3.5" stroke={1.75} />
        Save view
      </Button>
      <Dialog open={view.isOpen} onOpenChange={view.setOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              void view.save()
            }}
          >
            <DialogHeader>
              <DialogTitle>Save this view</DialogTitle>
              <DialogDescription>
                Filters and time range come back exactly as they are now.
              </DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="save-view-name">Name</FieldLabel>
              <Input
                id="save-view-name"
                value={view.name}
                maxLength={80}
                autoFocus
                onChange={(event) => view.setName(event.target.value)}
              />
            </Field>
            <DialogFooter>
              <Button type="submit" size="sm" disabled={!view.name.trim() || view.isSaving}>
                {view.isSaving && <Spinner className="size-3.5" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
