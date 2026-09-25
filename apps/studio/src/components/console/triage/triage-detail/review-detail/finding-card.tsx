import { cn } from '@code-whiskers/ui/lib/utils'
import { IconArrowUpRight } from '@tabler/icons-react'
import { type FindingCardProps, SEVERITY_DOT } from './lib'

const ACTION =
  'rounded-md px-2 py-[3px] font-medium text-[11px] text-muted-foreground hover:bg-rule-soft hover:text-foreground'

export function FindingCard({ finding, isDismissed, url, onToggle }: FindingCardProps) {
  const isBlockSuggestion = finding.suggestion?.includes('\n') ?? false

  return (
    <article
      className={cn(
        'group flex flex-col gap-2 border-rule-soft border-t px-4 py-3.5',
        isDismissed && 'bg-surface-subtle/60',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 font-medium text-[12px] capitalize">
          <span className={cn('size-1.5 rounded-full', SEVERITY_DOT[finding.severity])} />
          {finding.severity}
        </span>
        <span className="text-[11px] text-muted-foreground">{finding.category}</span>
        {finding.line !== null && (
          <span className="font-mono text-[11px] text-muted-foreground">L{finding.line}</span>
        )}
        {isDismissed && (
          <span className="rounded-md border border-border px-1.5 py-px text-[10px] text-muted-foreground">
            dismissed
          </span>
        )}
        <div className="ml-auto flex items-center gap-0.5">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className={cn(ACTION, 'flex items-center gap-0.5')}
            >
              View line <IconArrowUpRight className="size-3" />
            </a>
          )}
          <button type="button" onClick={onToggle} className={ACTION}>
            {isDismissed ? 'Restore' : 'Dismiss'}
          </button>
        </div>
      </div>

      <h4
        className={cn(
          'm-0 font-semibold text-[13.5px] leading-[19px] text-pretty',
          isDismissed && 'text-muted-foreground line-through',
        )}
      >
        {finding.title}
      </h4>
      {!isDismissed && finding.body && (
        <p className="m-0 text-[13px] text-body leading-[20px] text-pretty">{finding.body}</p>
      )}
      {!isDismissed && finding.suggestion && (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="border-rule-soft border-b bg-surface-subtle px-3 py-1.5 font-medium text-[11px] text-muted-foreground">
            Suggested fix
          </div>
          {isBlockSuggestion ? (
            <pre className="m-0 overflow-auto px-3 py-2 font-mono text-[11.5px] leading-[18px]">
              {finding.suggestion}
            </pre>
          ) : (
            <p className="m-0 px-3 py-2 text-[13px] text-body leading-[19px]">
              {finding.suggestion}
            </p>
          )}
        </div>
      )}
    </article>
  )
}
