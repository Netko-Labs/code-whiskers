import { Input } from '@code-whiskers/ui/components/input'
import { SettingRow } from '@/components/shared/page'
import type { ReviewerTextFieldProps } from './lib'

export function ReviewerTextField({ spec, value, onChange, onSubmit }: ReviewerTextFieldProps) {
  const id = `reviewer-${spec.field}`
  return (
    <SettingRow label={spec.label} htmlFor={id} description={spec.description}>
      <Input
        id={id}
        value={value}
        inputMode={spec.inputMode}
        placeholder={spec.placeholder}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSubmit()
        }}
        className="h-8 w-full font-mono text-xs sm:w-64"
      />
    </SettingRow>
  )
}
