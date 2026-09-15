import { Button } from '@code-whiskers/ui/components/button'
import { Input } from '@code-whiskers/ui/components/input'
import { Label } from '@code-whiskers/ui/components/label'
import type { SignInEmailFormProps } from './lib'
import {
  SIGN_IN_EMAIL_HINT,
  SIGN_IN_EMAIL_LABEL,
  SIGN_IN_EMAIL_PLACEHOLDER,
  SIGN_IN_EMAIL_SENDING,
  SIGN_IN_EMAIL_SUBMIT,
} from './lib'

export function SignInEmailForm({
  email,
  isLoading,
  message,
  onEmailChange,
  onSubmit,
}: SignInEmailFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-ink-text md:text-ink">
          {SIGN_IN_EMAIL_LABEL}
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={SIGN_IN_EMAIL_PLACEHOLDER}
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
          className="h-11 border-ink-hairline bg-ink-card text-base text-ink-text placeholder:text-ash md:h-9 md:border-hairline md:bg-paper md:text-sm md:text-ink"
        />
      </div>
      <Button
        type="submit"
        variant="secondary"
        disabled={isLoading}
        className="h-11 w-full border-ink-hairline bg-transparent text-[15px] text-ink-text hover:bg-ink-card md:h-10 md:border-transparent md:bg-fog md:text-sm md:text-ink md:hover:bg-hairline"
      >
        {isLoading ? SIGN_IN_EMAIL_SENDING : SIGN_IN_EMAIL_SUBMIT}
      </Button>
      <p
        role={message?.type === 'error' ? 'alert' : 'status'}
        className={`m-0 text-center text-xs leading-4 ${
          message?.type === 'error' ? 'text-severity-error' : 'text-ink-muted md:text-ash'
        }`}
      >
        {message?.text ?? SIGN_IN_EMAIL_HINT}
      </p>
    </form>
  )
}
