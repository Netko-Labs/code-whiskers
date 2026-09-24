import { useQuery, useQueryClient } from '@tanstack/react-query'
import { rerunReview, WHISKERS_QUERY_KEY, whiskersReviewQuery } from '@/integrations/whiskers'
import { findingRef, triageKey, useTriageRecords } from '../../../shared/console-data'
import { useConsoleStore } from '../../../use-console-store'
import type { DetailPaneProps } from '../../lib'
import { FindingCard } from './finding-card'

const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 } as const

export function ReviewFindings({ item, actions }: Omit<DetailPaneProps, 'status'>) {
  const records = useTriageRecords()
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    ...whiskersReviewQuery(item.sourceId ?? ''),
    enabled: !!item.sourceId,
    retry: false,
  })
  const scope = item.triage?.scope ?? ''
  const findings = [...(data?.findings ?? [])].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center justify-between gap-3 border-rule-soft border-b px-3.5 py-2.5">
        <span className="font-semibold text-[13px]">Findings</span>
        <span className="text-muted-foreground text-xs">
          Reply <span className="font-mono">@code-whiskers fix</span> on an inline comment to have
          Whiskers push the change
        </span>
        {data && (
          <button
            type="button"
            onClick={() => {
              const { owner, repo, prNumber } = data.review
              rerunReview({ owner, repo, prNumber })
                .then(() => {
                  useConsoleStore
                    .getState()
                    .flash(`Reviewing #${prNumber} again — results land in a minute or two`)
                  setTimeout(
                    () => void queryClient.invalidateQueries({ queryKey: [WHISKERS_QUERY_KEY] }),
                    30_000,
                  )
                })
                .catch((error: Error) => useConsoleStore.getState().flash(error.message))
            }}
            className="shrink-0 rounded-lg border border-border bg-background px-[9px] py-[3px] font-medium text-[11px]"
          >
            Run the review again
          </button>
        )}
      </div>
      {isLoading && <div className="px-3.5 py-3 text-muted-foreground text-xs">Loading…</div>}
      {isError && (
        <div className="px-3.5 py-3 text-muted-foreground text-xs">
          Whiskers did not answer — findings are on the pull request.
        </div>
      )}
      {data && findings.length === 0 && (
        <div className="px-3.5 py-3 text-muted-foreground text-xs">No findings on this push.</div>
      )}
      {findings.map((finding) => {
        const isDismissed =
          records.get(triageKey(findingRef(scope, finding)))?.status === 'dismissed'
        const url =
          item.commit && finding.line !== null
            ? `https://github.com/${scope}/blob/${item.commit}/${encodeURI(finding.file)}#L${finding.line}`
            : undefined
        return (
          <FindingCard
            key={finding.id}
            finding={finding}
            isDismissed={isDismissed}
            url={url}
            onToggle={() => actions.toggleFinding(finding, isDismissed)}
          />
        )
      })}
    </div>
  )
}
