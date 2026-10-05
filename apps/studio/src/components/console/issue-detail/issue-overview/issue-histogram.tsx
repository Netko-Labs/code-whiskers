import { cn } from '@code-whiskers/ui/lib/utils'
import { TrendBars } from '../../shared/issue-ui'
import { bucketLabel, type IssueHistogramProps, PERIODS } from '../lib'

export function IssueHistogram({ detail, period, onPeriod }: IssueHistogramProps) {
  const buckets = detail?.histogram ?? []
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0)
  const labels = buckets.map(
    (bucket) => `${bucketLabel(bucket.bucket, period)} · ${bucket.count.toLocaleString()}`,
  )
  const first = buckets[0]
  const last = buckets.at(-1)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-[15px] tracking-[-0.01em]">Events</span>
          <span className="font-mono text-[12px] text-muted-foreground tabular-nums">
            {total.toLocaleString()} in the last {period === '24h' ? '24 hours' : '14 days'}
          </span>
        </div>
        <div className="flex rounded-lg border border-border p-0.5">
          {PERIODS.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => onPeriod(option.value)}
              className={cn(
                'rounded-md px-2 py-0.5 font-mono text-[11px]',
                option.value === period
                  ? 'bg-foreground text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <TrendBars values={buckets.map((bucket) => bucket.count)} labels={labels} className="h-16" />
      <div className="flex justify-between font-mono text-[11px] text-faint">
        <span>{first ? bucketLabel(first.bucket, period) : ''}</span>
        <span>{last ? bucketLabel(last.bucket, period) : ''}</span>
      </div>
    </section>
  )
}
