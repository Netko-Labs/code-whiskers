import { Button } from '@code-whiskers/ui/components/button'
import { DRAFT_HINT } from '../../shared/console-data'
import { activityView, type IssueActivityProps, useIssueActivity } from '../lib'
import { IssueActivityEntry } from './issue-activity-entry'

/** Decisions, transitions and comments in one timeline, oldest first, with the draft at the foot. */
export function IssueActivity({ issue }: IssueActivityProps) {
  const { ref, entries, draft, setDraft, post } = useIssueActivity(issue)

  return (
    <section className="flex flex-col gap-3">
      <h3 className="m-0 font-semibold text-[13px]">Activity</h3>
      {entries.length === 0 && (
        <p className="m-0 text-[12px] text-muted-foreground">No decisions yet.</p>
      )}
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {entries.map((entry) => (
          <IssueActivityEntry key={entry.id} view={activityView(entry)} />
        ))}
      </ol>
      {ref && (
        <div className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                post()
              }
            }}
            placeholder="Leave a comment…"
            className="min-h-16 w-full resize-none rounded-[10px] border border-border bg-transparent px-2.5 py-2 text-[13px] leading-[19px] outline-none focus-visible:border-ring"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={post}>
              Comment
            </Button>
            <span className="text-[11px] text-muted-foreground">{DRAFT_HINT}</span>
          </div>
        </div>
      )}
    </section>
  )
}
