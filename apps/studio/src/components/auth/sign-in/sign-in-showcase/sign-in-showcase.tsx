import { CatExpression } from '@code-whiskers/ui/brand'
import { SIGN_IN_HEADLINE } from '../lib'
import { ShowcaseErrorCard } from './showcase-error-card'
import { ShowcaseLogs } from './showcase-logs'
import { ShowcaseReviewCard } from './showcase-review-card'

export function SignInShowcase() {
  return (
    <div className="hidden w-full max-w-[640px] min-w-0 flex-[1_1_320px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-stretch gap-3.5 md:grid">
      <div className="col-span-full flex flex-wrap items-end gap-4">
        <CatExpression
          expression="idle"
          animated
          crop
          tone="dark"
          size={96}
          className="flex-none"
        />
        <p className="m-0 min-w-[200px] flex-1 pb-2 text-[26px] font-bold leading-[1.15] tracking-tight text-ink-text text-pretty">
          {SIGN_IN_HEADLINE}
        </p>
      </div>
      <ShowcaseReviewCard />
      <ShowcaseErrorCard />
      <ShowcaseLogs />
    </div>
  )
}
