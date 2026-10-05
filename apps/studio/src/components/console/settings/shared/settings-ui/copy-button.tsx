import { Button } from '@code-whiskers/ui/components/button'
import { IconCopy } from '@tabler/icons-react'
import { useConsoleStore } from '../../../use-console-store'
import type { CopyButtonProps } from './lib'

export function CopyButton({ value, label, className }: CopyButtonProps) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label={`Copy ${label.toLowerCase()}`}
      title="Copy"
      className={className}
      onClick={() => {
        void navigator.clipboard
          .writeText(value)
          .then(() => useConsoleStore.getState().flash(`${label} copied`))
          .catch(() => useConsoleStore.getState().flash('The browser refused the clipboard'))
      }}
    >
      <IconCopy stroke={1.75} />
    </Button>
  )
}
