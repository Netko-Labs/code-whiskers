import { Button } from '@code-whiskers/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@code-whiskers/ui/components/dialog'
import { Field, FieldLabel } from '@code-whiskers/ui/components/field'
import { Input } from '@code-whiskers/ui/components/input'
import { useState } from 'react'
import type { RenameDialogProps } from './lib'

/** Keyed by the view it renames, so the field starts from that view's name. */
export function RenameDialog({ saved, onClose, onRename }: RenameDialogProps) {
  const [name, setName] = useState(saved?.name ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const trimmed = name.trim()

  return (
    <Dialog open={saved !== null} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <form
          className="flex flex-col gap-4"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!saved || !trimmed) return
            setIsSaving(true)
            const isDone = await onRename(saved, trimmed)
            setIsSaving(false)
            if (isDone) onClose()
          }}
        >
          <DialogHeader>
            <DialogTitle>Rename view</DialogTitle>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="rename-view">Name</FieldLabel>
            <Input
              id="rename-view"
              value={name}
              maxLength={80}
              autoFocus
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button
              type="submit"
              size="sm"
              disabled={!trimmed || isSaving || trimmed === saved?.name}
            >
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
