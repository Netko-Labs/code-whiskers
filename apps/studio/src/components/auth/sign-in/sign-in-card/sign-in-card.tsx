import { Button } from '@code-whiskers/ui/components/button'
import { IconBrandGithub } from '@tabler/icons-react'
import {
  SIGN_IN_DESCRIPTION,
  SIGN_IN_GITHUB,
  SIGN_IN_HINT,
  SIGN_IN_PRIVACY,
  SIGN_IN_TERMS,
  SIGN_IN_TERMS_JOIN,
  SIGN_IN_TERMS_PREFIX,
  SIGN_IN_TITLE,
  useRedirectWhenSignedIn,
  useSignIn,
} from './lib'

export function SignInCard() {
  useRedirectWhenSignedIn()
  const { isLoading, message, continueWithGithub } = useSignIn()

  return (
    <section className="flex w-full min-w-0 flex-col gap-5 px-1 md:max-w-[400px] md:flex-[1_1_320px] md:rounded-[14px] md:bg-paper md:p-8 md:text-ink md:shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)]">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-[22px] font-bold leading-[1.15] tracking-tight text-ink-text text-pretty md:text-[26px] md:text-ink">
          {SIGN_IN_TITLE}
        </h1>
        <p className="m-0 text-sm leading-5 text-ink-muted md:text-ash">{SIGN_IN_DESCRIPTION}</p>
      </div>

      <Button
        type="button"
        onClick={continueWithGithub}
        disabled={isLoading}
        className="h-11 w-full gap-2 border border-ink-text bg-ink-text text-[15px] text-ink hover:bg-ink-text/90 md:h-10 md:border-ink md:bg-ink md:text-sm md:text-paper md:hover:bg-ink/90"
      >
        <IconBrandGithub className="size-4" aria-hidden="true" />
        {SIGN_IN_GITHUB}
      </Button>

      <p
        role="status"
        className={`m-0 min-h-4 text-center text-xs ${
          message?.type === 'error' ? 'text-severity-error' : 'text-ink-muted md:text-ash'
        }`}
      >
        {message?.text ?? SIGN_IN_HINT}
      </p>

      <p className="m-0 border-t border-ink-hairline pt-4 text-center text-xs leading-4 text-ink-muted text-pretty md:border-hairline md:text-ash">
        {SIGN_IN_TERMS_PREFIX}
        <a href="#" className="text-ink-text md:text-ink">
          {SIGN_IN_TERMS}
        </a>
        {SIGN_IN_TERMS_JOIN}
        <a href="#" className="text-ink-text md:text-ink">
          {SIGN_IN_PRIVACY}
        </a>
        .
      </p>
    </section>
  )
}
