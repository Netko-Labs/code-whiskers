import { CatMark } from '@code-whiskers/ui/brand'
import { Button } from '@code-whiskers/ui/components/button'
import {
  REVIEW_ADDED,
  REVIEW_APPLY,
  REVIEW_BOT,
  REVIEW_DISMISS,
  REVIEW_FINDING,
  REVIEW_LABEL,
  REVIEW_LOCATION,
  REVIEW_PR,
  REVIEW_REMOVED,
  REVIEW_SYMBOL,
} from './lib'

export function ShowcaseReviewCard() {
  return (
    <article className="flex flex-col overflow-hidden rounded-[14px] border border-hairline bg-paper text-ink">
      <header className="flex items-center gap-2 whitespace-nowrap border-b border-hairline px-3.5 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-severity-warning">
        {REVIEW_LABEL}
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-normal tracking-normal text-ash">
          <CatMark cut="round" tone="dark" size={18} className="rounded-full bg-ink" />
          <span className="font-semibold text-ink">{REVIEW_BOT}</span>
          {REVIEW_PR}
        </span>
      </header>
      <div className="flex flex-col gap-2.5 px-3.5 pt-3 pb-3.5 text-[13px] leading-normal">
        <p className="m-0">
          <code className="rounded-md bg-fog px-1.5 py-px font-mono text-xs">
            {REVIEW_LOCATION}
          </code>
          {' — '}
          <code className="font-mono text-xs">{REVIEW_SYMBOL}</code>
          {REVIEW_FINDING}
        </p>
        <div className="overflow-hidden rounded-lg border border-hairline font-mono text-xs leading-[1.8]">
          <div className="px-3 text-ash">
            <span className="text-severity-error">−</span> {REVIEW_REMOVED}
          </div>
          <div className="bg-fog px-3">
            <span className="text-severity-resolved">+</span> {REVIEW_ADDED}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-ink text-paper hover:bg-ink/90">
            {REVIEW_APPLY}
          </Button>
          <Button size="sm" variant="ghost" className="text-ink hover:bg-fog">
            {REVIEW_DISMISS}
          </Button>
        </div>
      </div>
    </article>
  )
}
