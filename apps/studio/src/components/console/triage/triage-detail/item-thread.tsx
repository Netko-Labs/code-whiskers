import { Button } from '@code-whiskers/ui/components/button'
import { cn } from '@code-whiskers/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { triageCommentsQuery } from '@/integrations/studio-api'
import { formatAge } from '@/shared/format-date'
import { initialsOf, useViewer } from '../../shared/console-data'
import { useConsoleStore } from '../../use-console-store'
import { DRAFT_HINT, type ItemThreadProps } from '../lib'

const AVATAR =
  'flex size-[26px] shrink-0 items-center justify-center rounded-full font-semibold text-[9px]'

export function ItemThread({ item, onPost }: ItemThreadProps) {
  const viewer = useViewer()
  const draft = useConsoleStore((s) => s.drafts[item.id] ?? '')
  const { data: comments = [] } = useQuery({
    ...triageCommentsQuery(item.triage ?? { scope: '', itemKind: 'review', itemRef: '' }),
    enabled: item.triage !== null,
    retry: false,
  })

  if (!item.triage) {
    return (
      <div className="rounded-2xl border border-border p-3.5 text-[13px] text-muted-foreground">
        Comments are saved once this is a real item — sample data stays read-only.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border p-3.5">
      <span className="font-semibold text-[13px]">Discussion</span>
      {comments.map((comment) => {
        const isSelf = comment.authorUserId === viewer?.id
        const who = comment.authorName ?? 'Former member'
        return (
          <div key={comment.id} className="flex items-start gap-2.5">
            <span
              className={cn(
                AVATAR,
                isSelf ? 'bg-foreground text-primary-foreground' : 'bg-muted text-foreground',
              )}
            >
              {initialsOf(who)}
            </span>
            <div className="flex min-w-0 flex-col gap-[3px]">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-[13px]">{who}</span>
                <span className="text-[11px] text-muted-foreground">
                  {formatAge(comment.createdAt)} ago
                </span>
              </div>
              <span className="whitespace-pre-wrap text-[13px] text-body leading-[19px] text-pretty">
                {comment.body}
              </span>
            </div>
          </div>
        )
      })}

      <div className="flex items-start gap-2.5">
        <span className={cn(AVATAR, 'bg-foreground text-primary-foreground')}>
          {viewer ? initialsOf(viewer.name) : ''}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <textarea
            value={draft}
            onChange={(event) => useConsoleStore.getState().setDraft(item.id, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                onPost()
              }
            }}
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
