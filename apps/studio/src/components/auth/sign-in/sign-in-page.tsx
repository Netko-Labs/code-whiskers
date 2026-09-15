import { CatExpression } from '@code-whiskers/ui/brand'
import { SIGN_IN_HEADLINE } from './lib'
import { SignInBackdrop } from './sign-in-backdrop'
import { SignInCard } from './sign-in-card'
import { SignInFooter } from './sign-in-footer'
import { SignInNav } from './sign-in-nav'
import { SignInShowcase } from './sign-in-showcase'

export function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-ink font-sans text-ink-text">
      <SignInBackdrop />
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col">
        <SignInNav />
        <main className="flex flex-1 flex-wrap items-stretch justify-center gap-6 px-4 pt-2 pb-4 md:items-center md:gap-14 md:px-10 md:py-8">
          <div className="flex basis-full flex-col items-center gap-2.5 px-1 pt-2 text-center md:hidden">
            <CatExpression expression="idle" animated crop tone="dark" size={104} />
            <p className="m-0 max-w-[320px] text-[22px] font-bold leading-[1.15] tracking-tight text-pretty">
              {SIGN_IN_HEADLINE}
            </p>
          </div>
          <SignInCard />
          <SignInShowcase />
        </main>
        <SignInFooter />
      </div>
    </div>
  )
}
