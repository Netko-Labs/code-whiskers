import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@code-whiskers/ui/components/dialog'
import type { MemoryNoteDialogProps } from './lib'
import { NoteForm } from './note-form'

/** The form mounts per draft, so opening it on another note starts clean. */
export function MemoryNoteDialog({
  draft,
  organizations,
  repositories,
  onClose,
}: MemoryNoteDialogProps) {
  return (
    <Dialog open={draft !== null} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{draft?.id ? 'Edit note' : 'Add a note'}</DialogTitle>
          <DialogDescription>
            Whiskers reads every note that applies to a pull request before it reviews it.
          </DialogDescription>
        </DialogHeader>
        {draft && (
          <NoteForm
            key={draft.id ?? 'new'}
            initial={draft}
            organizations={organizations}
            repositories={repositories}
            onDone={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
