import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@code-whiskers/ui/components/dialog'
import type { ReviewRuleDialogProps } from './lib'
import { RuleForm } from './rule-form'

/** The form mounts per draft, so opening it on another rule starts clean. */
export function ReviewRuleDialog({ draft, organizations, onClose }: ReviewRuleDialogProps) {
  return (
    <Dialog open={draft !== null} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{draft?.id ? 'Edit rule' : 'Write a review rule'}</DialogTitle>
          <DialogDescription>
            Whiskers reads every active rule on each pull request and quotes the one it applied.
          </DialogDescription>
        </DialogHeader>
        {draft && (
          <RuleForm
            key={draft.id ?? 'new'}
            initial={draft}
            organizations={organizations}
            onDone={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
