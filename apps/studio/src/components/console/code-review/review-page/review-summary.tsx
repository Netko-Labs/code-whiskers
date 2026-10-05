import { Section } from '@/components/shared/page'
import { SeverityDot } from '@/components/shared/status'
import { pushCoverage, shortSha, summaryLines } from '../shared/review-model'
import type { ReviewSummaryProps } from './lib'

/** What the reviewer read and what it concluded, in its own words. */
export function ReviewSummary({ data }: ReviewSummaryProps) {
  const { selected } = data

  if (selected.status === 'pending' || selected.status === 'running') {
    return (
      <Section title="Summary">
        <p className="m-0 flex items-center gap-2 text-muted-foreground text-ui">
          <SeverityDot tone="info" size="sm" isPulsing />
          Reviewing this push… findings land in a minute or two.
        </p>
      </Section>
    )
  }
  if (selected.status === 'failed') {
    return (
      <Section title="Summary" description="The review failed after its retries.">
        <pre className="m-0 whitespace-pre-wrap rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-muted-foreground text-xs">
          {selected.summary ?? 'No error was recorded.'}
        </pre>
      </Section>
    )
  }

  const lines = summaryLines(selected.summary)
  const coverage = pushCoverage(selected.summary)
  return (
    <Section title="Summary">
      {lines.length > 1 ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {lines.map((line) => (
            <li key={line} className="flex gap-2.5 text-body text-ui leading-[21px]">
              <span className="mt-[9px] size-1 shrink-0 rounded-full bg-faint" />
              <span className="text-pretty">{line}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-pretty text-body text-ui leading-[21px]">
          {lines[0] ?? 'The reviewer left no summary.'}
        </p>
      )}
      <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-muted-foreground">
        <span>
          {selected.diffScope === 'delta' && selected.deltaFrom
            ? `Read only what changed since ${shortSha(selected.deltaFrom)}`
            : selected.diffScope === 'full'
              ? 'Read the whole diff'
              : 'Scope not recorded for this push'}
        </span>
        {coverage && (
          <span className="inline-flex items-center gap-1.5">
            <SeverityDot tone="warning" size="sm" />
            Partial: {coverage.skipped} of {coverage.total} sections could not be read; the next
            push reads it all again
          </span>
        )}
      </p>
    </Section>
  )
}
