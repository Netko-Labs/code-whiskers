import { Button } from '@code-whiskers/ui/components/button'
import { useQuery } from '@tanstack/react-query'
import { triageCommentsQuery } from '@/integrations/studio-api'
import { formatAge } from '@/shared/format-date'
import { useViewer } from '../../shared/console-data'
import { PersonAvatar } from '../../shared/console-ui'
import { useConsoleStore } from '../../use-console-store'
import { DRAFT_HINT, type ItemThreadProps } from '../lib'

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
      <div className="border-rule-soft border-t pt-5 text-[13px] text-muted-foreground">
        Comments are saved once this is a real item — sample data stays read-only.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 border-rule-soft border-t pt-5">
      <span className="font-semibold text-[15px] tracking-[-0.01em]">Discussion</span>
      {comments.map((comment) => {
        const isSelf = comment.authorUserId === viewer?.id
        const who = comment.authorName ?? 'Former member'
        return (
          <div key={comment.id} className="flex items-start gap-2.5">
            <PersonAvatar name={who} image={comment.authorImage} isSelf={isSelf} />
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
        <PersonAvatar name={viewer?.name ?? ''} image={viewer?.image} isSelf />
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
