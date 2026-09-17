import { Button } from '@code-whiskers/ui/components/button'
import { cn } from '@code-whiskers/ui/lib/utils'
import { VIEWER } from '../../../shared/console-data'
import { useConsoleStore } from '../../../use-console-store'
import { DRAFT_HINT } from '../../lib'

export function ReviewThread({ onPost }: { onPost: () => void }) {
  const comments = useConsoleStore((s) => s.comments)
  const draft = useConsoleStore((s) => s.draft)

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border p-3.5">
      <span className="font-semibold text-[13px]">Review thread</span>
      {comments.map((comment, index) => (
        <div key={`${comment.who}-${index}`} className="flex items-start gap-2.5">
          <span
            className={cn(
              'flex size-[26px] shrink-0 items-center justify-center rounded-full font-semibold text-[9px]',
              comment.self ? 'bg-foreground text-primary-foreground' : 'bg-muted text-foreground',
            )}
          >
            {comment.initials}
          </span>
          <div className="flex min-w-0 flex-col gap-[3px]">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-[13px]">{comment.who}</span>
              <span className="text-[11px] text-muted-foreground">{comment.when}</span>
            </div>
            <span className="text-[13px] text-body leading-[19px] text-pretty">{comment.body}</span>
          </div>
        </div>
      ))}

      <div className="flex items-start gap-2.5">
        <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-foreground font-semibold text-[9px] text-primary-foreground">
          {VIEWER.initials}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <textarea
            value={draft}
            onChange={(event) => useConsoleStore.getState().setDraft(event.target.value)}
            placeholder="Leave a comment…"
            className="min-h-16 w-full resize-none rounded-[10px] border border-border px-2.5 py-2 text-[13px] leading-[19px] shadow-sm outline-none focus-visible:border-ring"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onPost}>
              Comment
            </Button>
            <span className="text-[11px] text-muted-foreground">{DRAFT_HINT}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
