import { Button } from '@code-whiskers/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@code-whiskers/ui/components/dialog'
import { IconAlertTriangle } from '@tabler/icons-react'
import { CopyButton } from '../shared/settings-ui'
import type { ApiKeySecretDialogProps } from './lib'

/** The only time the key exists outside a hash: copy it, then it is gone. */
export function ApiKeySecretDialog({ secret, onClose }: ApiKeySecretDialogProps) {
  return (
    <Dialog
      open={secret !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{secret?.name} is ready</DialogTitle>
          <DialogDescription>Send it as a bearer token to /v1.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-subtle py-1 pr-1 pl-3">
          <code className="min-w-0 flex-1 select-all break-all font-mono text-xs">
            {secret?.key}
          </code>
          {secret && <CopyButton value={secret.key} label="Key" />}
        </div>
        <p className="m-0 flex items-start gap-2 text-2xs text-severity-warning-ink">
          <IconAlertTriangle className="mt-px size-3.5 shrink-0" stroke={1.75} />
          It won't be shown again. Only a hash is stored; lose it and you create another.
        </p>
        <DialogFooter>
          <Button size="sm" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
