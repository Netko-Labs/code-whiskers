import { KeyValue, KeyValueList, Panel } from '@/components/shared/page'
import { type InstanceReviewerProps, perReview } from './lib'

/** Tokens the reviewer spent this week, counted across chunks, retries and splits. */
export function InstanceReviewer({ reviewer }: InstanceReviewerProps) {
  const reviews = reviewer.meteredReviews7d
  const rows = [
    { label: 'Input', total: reviewer.inputTokens7d },
    { label: 'Output', total: reviewer.outputTokens7d },
    { label: 'Reasoning', total: reviewer.reasoningTokens7d },
  ]

  return (
    <Panel
      title="Reviewer"
      description={`${reviews.toLocaleString()} reviews measured in the last 7 days`}
    >
      <KeyValueList>
        <KeyValue label="Model" isMono>
          {reviewer.model ?? 'REVIEW_MODEL unset'}
        </KeyValue>
        {rows.map((row) => (
          <KeyValue key={row.label} label={`${row.label} tokens`} isMono>
            {row.total.toLocaleString()}
            <span className="ml-2 text-muted-foreground">
              {perReview(row.total, reviews)} per review
            </span>
          </KeyValue>
        ))}
      </KeyValueList>
    </Panel>
  )
}
