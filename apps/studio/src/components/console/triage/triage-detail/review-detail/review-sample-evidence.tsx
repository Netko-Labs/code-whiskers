import { CatExpression } from '@code-whiskers/ui/brand'
import { CodeHunk } from '../../../shared/console-ui'
import type { ReviewDetailProps } from './lib'

/** The fixture's flagged hunk — only sample reviews carry one; real findings come from whiskers. */
export function ReviewSampleEvidence({ item, actions }: ReviewDetailProps) {
  if (!item.hunk?.length) return null

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-center gap-2 border-border border-b bg-surface-subtle px-3.5 py-2.5">
        <span className="font-medium font-mono text-xs">{item.blockerFile}</span>
        <span className="rounded-md bg-severity-error/10 px-1.5 py-0.5 font-semibold text-[10px] text-severity-error">
          {item.blockerKind}
        </span>
      </div>
      <CodeHunk lines={item.hunk} />
      <div className="flex items-start gap-3 border-border border-t bg-surface-subtle px-3.5 py-3">
        <CatExpression expression="blocker" crop size={34} className="shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
          <span className="text-[13px] text-body leading-[19px] text-pretty">
            {item.blockerNote}
          </span>
          <button
            type="button"
            onClick={actions.openFix}
            className="mt-0.5 self-start rounded-lg bg-foreground px-[9px] py-[5px] font-medium text-[11px] text-primary-foreground"
          >
            Apply suggestion
          </button>
        </div>
      </div>
    </div>
  )
}
