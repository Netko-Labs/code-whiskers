import { Button } from '@code-whiskers/ui/components/button'
import { Input } from '@code-whiskers/ui/components/input'
import { SettingRow } from '@/components/shared/page'
import { StatusBadge } from '@/components/shared/status'
import {
  CREDENTIAL_BADGE,
  CREDENTIAL_LABEL,
  CREDENTIAL_USE,
  type ReviewerCredentialRowProps,
  useReviewerCredential,
} from './lib'

export function ReviewerCredentialRow({ credential, state }: ReviewerCredentialRowProps) {
  const form = useReviewerCredential(credential.name)
  const badge = CREDENTIAL_BADGE[state]
  const id = `credential-${credential.name}`

  return (
    <SettingRow
      label={CREDENTIAL_LABEL[credential.name]}
      htmlFor={id}
      description={
        <>
          <span className="font-mono">{credential.name}</span> · {CREDENTIAL_USE[credential.name]}
        </>
      }
    >
      <form
        className="flex w-full items-center gap-2 sm:w-auto"
        onSubmit={(event) => {
          event.preventDefault()
          form.save()
        }}
      >
        <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
        <Input
          id={id}
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={form.value}
          placeholder={credential.isSet ? 'Paste to replace' : 'Paste key'}
          onChange={(event) => form.setValue(event.target.value)}
          className="h-8 w-full font-mono text-xs sm:w-56"
        />
        {form.value ? (
          <Button type="submit" size="sm" disabled={form.isPending}>
            Save
          </Button>
        ) : (
          credential.isSet && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={form.isPending}
              onClick={form.remove}
            >
              Remove
            </Button>
          )
        )}
      </form>
    </SettingRow>
  )
}
