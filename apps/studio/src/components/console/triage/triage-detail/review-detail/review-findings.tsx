import { cn } from '@code-whiskers/ui/lib/utils'
import { useState } from 'react'
import {
  blobUrl,
  FIX_HINT,
  groupByFile,
  type ReviewFindingsProps,
  SEVERITY_DOT,
  SEVERITY_ORDER,
  type SeverityFilter,
  severityCounts,
} from './lib'
import { ReviewFileGroup } from './review-file-group'

const CHIP = 'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium text-xs'

export function ReviewFindings({ item, detail, decisions, actions }: ReviewFindingsProps) {
  const [severity, setSeverity] = useState<SeverityFilter>('all')
  const [isShowingDismissed, setShowingDismissed] = useState(false)
  const { open, dismissedCount, isDismissed } = decisions
  const slug = item.repository ?? item.triage?.scope ?? ''
  const counts = severityCounts(open)
  const shown = (isShowingDismissed ? detail.findings : open).filter(
    (finding) => severity === 'all' || finding.severity === severity,
  )
  const groups = groupByFile(shown)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <h3 className="m-0 mr-2 font-semibold text-[15px] tracking-[-0.01em]">
          Findings <span className="font-normal text-muted-foreground">{open.length}</span>
        </h3>
        {(['all', ...SEVERITY_ORDER] as const).map((option) => {
          const count = option === 'all' ? open.length : counts[option]
          if (option !== 'all' && count === 0) return null
          return (
            <button
              type="button"
              key={option}
              onClick={() => setSeverity(option)}
              className={cn(
                CHIP,
                option === severity
                  ? 'border-foreground bg-foreground text-primary-foreground'
                  : 'border-border bg-background text-body hover:bg-surface-subtle',
              )}
            >
              {option !== 'all' && (
                <span className={cn('size-[7px] rounded-full', SEVERITY_DOT[option])} />
              )}
              <span className="capitalize">{option}</span>
              <span className="font-mono opacity-70">{count}</span>
            </button>
          )
        })}
        {dismissedCount > 0 && (
          <button
            type="button"
            onClick={() => setShowingDismissed(!isShowingDismissed)}
            className="ml-auto text-[12px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {isShowingDismissed ? 'Hide' : 'Show'} {dismissedCount} dismissed
          </button>
        )}
      </div>

      {detail.isLoading && <p className="m-0 text-[13px] text-muted-foreground">Loading…</p>}
      {detail.isError && (
        <p className="m-0 text-[13px] text-muted-foreground">
          Whiskers did not answer — the findings are on the pull request.
        </p>
      )}
      {detail.review && groups.length === 0 && (
        <div className="rounded-xl border border-border border-dashed px-4 py-6 text-center text-[13px] text-muted-foreground">
          {detail.findings.length === 0
            ? 'No findings on this push.'
            : 'Nothing open at this severity.'}
        </div>
      )}
      {groups.map((group) => (
        <ReviewFileGroup
          key={group.file}
          group={group}
          fileUrl={item.commit ? blobUrl(slug, item.commit, group.file) : undefined}
          lineUrl={(finding) =>
            item.commit && finding.line !== null
              ? blobUrl(slug, item.commit, finding.file, finding.line)
              : undefined
          }
          isDismissed={isDismissed}
          onToggle={actions.toggleFinding}
        />
      ))}
      {groups.length > 0 && <p className="m-0 text-[12px] text-faint">{FIX_HINT}</p>}
    </section>
  )
}
