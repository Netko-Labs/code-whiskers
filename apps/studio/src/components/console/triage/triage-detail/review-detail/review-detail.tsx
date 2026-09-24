import { CatExpression } from '@code-whiskers/ui/brand'
import { cn } from '@code-whiskers/ui/lib/utils'
import { CodeHunk, TONE_TEXT } from '../../../shared/console-ui'
import type { DetailPaneProps } from '../../lib'
import { ReviewFindings } from './review-findings'
import { ReviewHistory } from './review-history'

const CARD = 'flex flex-col gap-[3px] rounded-xl border border-border px-3.5 py-3'

export function ReviewDetail({ item, actions }: Omit<DetailPaneProps, 'status'>) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        <div className={CARD}>
          <span className="text-[11px] text-muted-foreground">Diff</span>
          <span className="font-mono font-semibold text-[15px]">{item.diff}</span>
        </div>
        <div className={CARD}>
          <span className="text-[11px] text-muted-foreground">Commit</span>
          <span className="font-mono font-semibold text-[15px]">
            {item.commit?.slice(0, 7) ?? item.fileCount}
          </span>
        </div>
        <div className={CARD}>
          <span className="text-[11px] text-muted-foreground">Review</span>
          <span className="font-semibold text-sm">{item.checks}</span>
        </div>
        <div className={CARD}>
          <span className="text-[11px] text-muted-foreground">Author</span>
          <span className="font-medium text-sm">{item.author}</span>
        </div>
      </div>

      {item.hunk && item.hunk.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="flex items-center gap-2 border-border border-b bg-surface-subtle px-3.5 py-2.5">
            <span className="font-medium font-mono text-xs">{item.blockerFile}</span>
            <span className="rounded-md bg-severity-error/10 px-1.5 py-0.5 font-semibold text-[10px] text-severity-error">
              {item.blockerKind}
            </span>
            <span className="ml-auto text-[11px] text-muted-foreground">flagged by Whiskers</span>
          </div>
          <CodeHunk lines={item.hunk} />
          <div className="flex items-start gap-3 border-border border-t bg-surface-subtle px-3.5 py-3">
            <CatExpression expression="blocker" crop size={34} className="shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
              <span className="text-[13px] text-body leading-[19px] text-pretty">
                {item.blockerNote}
              </span>
              <div className="mt-0.5 flex gap-1.5">
                <button
                  type="button"
                  onClick={actions.openFix}
                  className="rounded-lg bg-foreground px-[9px] py-[5px] font-medium text-[11px] text-primary-foreground"
                >
                  Apply suggestion
                </button>
                <button
                  type="button"
                  onClick={actions.onEvidence}
                  className="rounded-lg border border-border bg-background px-[9px] py-[5px] font-medium text-[11px]"
                >
                  Not a blocker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {item.files && item.files.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="flex items-center justify-between border-rule-soft border-b px-3.5 py-2.5">
            <span className="font-semibold text-[13px]">Files</span>
            <span className="text-muted-foreground text-xs">{item.fileCount} changed</span>
          </div>
          {item.files.map((file) => (
            <div
              key={file.path}
              className="grid grid-cols-[1fr_120px_88px] items-center gap-3 border-rule-soft border-b px-3.5 py-[9px]"
            >
              <span className="font-mono text-xs">{file.path}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{file.diff}</span>
              <span className={cn('text-right text-[11px]', TONE_TEXT[file.tone])}>
                {file.note}
              </span>
            </div>
          ))}
        </div>
      )}

      {item.sourceId && <ReviewFindings item={item} actions={actions} />}
      {item.sourceId && <ReviewHistory item={item} />}
    </div>
  )
}
