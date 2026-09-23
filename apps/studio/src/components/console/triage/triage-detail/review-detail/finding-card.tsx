import { cn } from '@code-whiskers/ui/lib/utils'
import type { FindingCardProps } from '../../lib'

const SEVERITY_CHIP = {
  critical: 'bg-severity-error/10 text-severity-error-ink',
  high: 'bg-severity-error/10 text-severity-error-ink',
  medium: 'bg-severity-warning/10 text-severity-warning-ink',
  low: 'bg-muted text-muted-foreground',
} as const

export function FindingCard({ finding, isDismissed, url, onToggle }: FindingCardProps) {
  const where = finding.line === null ? finding.file : `${finding.file}:${finding.line}`
  const hasBlockSuggestion = finding.suggestion?.includes('\n') ?? false

  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-rule-soft border-b px-3.5 py-3',
        isDismissed && 'opacity-60',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'rounded-md px-1.5 py-0.5 font-semibold text-[10px] uppercase',
            SEVERITY_CHIP[finding.severity],
          )}
        >
          {finding.severity}
        </span>
        <span className="text-[11px] text-muted-foreground">{finding.category}</span>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] underline-offset-2 hover:underline"
          >
            {where}
          </a>
        ) : (
          <span className="font-mono text-[11px]">{where}</span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="ml-auto rounded-lg border border-border bg-background px-[9px] py-[3px] font-medium text-[11px]"
        >
          {isDismissed ? 'Restore' : 'Dismiss'}
        </button>
      </div>
      <span className={cn('font-semibold text-[13px] text-pretty', isDismissed && 'line-through')}>
        {finding.title}
      </span>
      {finding.body && (
        <span className="text-[13px] text-body leading-[19px] text-pretty">{finding.body}</span>
      )}
      {finding.suggestion &&
        (hasBlockSuggestion ? (
          <pre className="overflow-auto rounded-lg bg-surface-subtle px-3 py-2 font-mono text-[11px] leading-[17px]">
            {finding.suggestion}
          </pre>
        ) : (
          <span className="text-[13px] text-body leading-[19px]">
            <span className="font-semibold">Fix</span> — {finding.suggestion}
          </span>
        ))}
    </div>
  )
}
