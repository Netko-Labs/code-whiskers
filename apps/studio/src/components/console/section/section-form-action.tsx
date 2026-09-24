import { Button } from '@code-whiskers/ui/components/button'
import { useState } from 'react'
import type { SectionFormActionProps } from './lib'
import { SectionFormDialog } from './section-form-dialog'

export function SectionFormAction({ action }: SectionFormActionProps) {
  const [isOpen, setOpen] = useState(false)
  if (!action.form) return null

  return (
    <>
      <Button
        size="sm"
        variant={action.variant === 'outline' ? 'outline' : 'default'}
        onClick={() => setOpen(true)}
      >
        {action.label}
      </Button>
      <SectionFormDialog form={action.form} isOpen={isOpen} onOpenChange={setOpen} />
    </>
  )
}
