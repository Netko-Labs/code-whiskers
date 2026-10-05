import { cn } from '@code-whiskers/ui/lib/utils'
import { IconArrowUpRight } from '@tabler/icons-react'
import { SeverityDot, StatusBadge } from '@/components/shared/status'
import { FINDING_STATUS_LABEL, SEVERITY_TONE, shortSha } from '../shared/review-model'
import { type ReviewFindingProps, suggestionBlock } from './lib'

const ACTION =
  'focus-ring inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 font-medium text-2xs text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground'

export function ReviewFinding({ entry, lineUrl, onToggle }: ReviewFindingProps) {
  const { finding, status, settledBy } = entry
  const isOpen = status === 'open'
  const suggestion = finding.suggestion ? suggestionBlock(finding.suggestion) : null

  return (
    <article
      className={cn(
        'group/finding flex flex-col gap-2 border-rule-soft border-t px-4 py-3.5',
        !isOpen && 'bg-surface-subtle/50',
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="inline-flex items-center gap-1.5 font-medium text-2xs capitalize">
          <SeverityDot tone={SEVERITY_TONE[finding.severity]} size="sm" />
          {finding.severity}
        </span>
        <span className="text-2xs text-muted-foreground">{finding.category}</span>
        {finding.line !== null && (
          <span className="font-mono text-2xs text-muted-foreground">L{finding.line}</span>
        )}
        {!isOpen && (
          <StatusBadge tone={status === 'resolved' ? 'resolved' : 'neutral'}>
            {FINDING_STATUS_LABEL[status]}
            {settledBy && status !== 'dismissed' && (
              <span className="font-mono text-muted-foreground">{shortSha(settledBy.headSha)}</span>
            )}
          </StatusBadge>
        )}
        <span className="ml-auto flex items-center gap-0.5">
          {lineUrl && (
            <a href={lineUrl} target="_blank" rel="noreferrer" className={ACTION}>
              View line
              <IconArrowUpRight className="size-3" stroke={1.75} />
            </a>
          )}
          {(status === 'open' || status === 'dismissed') && (
            <button type="button" onClick={onToggle} className={ACTION}>
              {status === 'dismissed' ? 'Restore' : 'Dismiss'}
            </button>
          )}
        </span>
      </div>

      <h3
        className={cn(
          'm-0 text-pretty font-semibold text-ui leading-5',
          !isOpen && 'text-muted-foreground',
          status === 'dismissed' && 'line-through',
        )}
      >
        {finding.title}
      </h3>
      {isOpen && finding.body && (
        <p className="m-0 whitespace-pre-line text-pretty text-body text-ui leading-5">
          {finding.body}
        </p>
      )}
      {isOpen && suggestion && (
        <div className="dark overflow-hidden rounded-lg border border-ink-hairline bg-ink-card">
          <div className="border-ink-hairline border-b px-3 py-1.5 font-medium text-2xs text-ink-muted">
            Suggested fix
          </div>
          {suggestion.isBlock ? (
            <pre className="m-0 overflow-x-auto px-3 py-2 font-mono text-ink-text text-xs leading-5">
              {suggestion.code}
            </pre>
          ) : (
            <p className="m-0 px-3 py-2 text-ink-text text-ui leading-5">{suggestion.code}</p>
          )}
        </div>
      )}
    </article>
  )
}
