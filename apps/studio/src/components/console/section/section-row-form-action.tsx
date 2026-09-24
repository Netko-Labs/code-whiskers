import { useState } from 'react'
import type { SectionRowFormActionProps } from './lib'
import { SectionFormDialog } from './section-form-dialog'

export function SectionRowFormAction({ action, className }: SectionRowFormActionProps) {
  const [isOpen, setOpen] = useState(false)
  if (!action.form) return null

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen(true)
        }}
        className={className}
      >
        {action.label}
      </button>
      <SectionFormDialog form={action.form} isOpen={isOpen} onOpenChange={setOpen} />
    </>
  )
}
