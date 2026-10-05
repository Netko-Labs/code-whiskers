import { cn } from '@code-whiskers/ui/lib/utils'
import { IconArrowUpRight, IconChevronRight, IconFileCode } from '@tabler/icons-react'
import { useState } from 'react'
import { SeverityDot } from '@/components/shared/status'
import { blobUrl, SEVERITY_TONE, splitPath } from '../shared/review-model'
import type { ReviewFileProps } from './lib'
import { ReviewFinding } from './review-finding'

/** One file's findings, folded under a mono path header like a diff file in a PR. */
export function ReviewFile({ group, slug, sha, onToggle }: ReviewFileProps) {
  const [isOpen, setOpen] = useState(true)
  const { directory, name } = splitPath(group.file)

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 bg-surface-subtle px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen(!isOpen)}
          aria-expanded={isOpen}
          className="focus-ring flex min-w-0 flex-1 items-center gap-2 rounded-sm text-left"
        >
          <IconChevronRight
            className={cn(
              'size-3.5 shrink-0 text-muted-foreground transition-transform duration-base',
              isOpen && 'rotate-90',
            )}
            stroke={2}
          />
          <IconFileCode className="size-4 shrink-0 text-muted-foreground" stroke={1.75} />
          <span className="min-w-0 truncate font-mono text-xs" title={group.file}>
            <span className="text-muted-foreground">{directory}</span>
            <span className="font-medium text-foreground">{name}</span>
          </span>
        </button>
        <span className="flex shrink-0 items-center gap-1">
          {group.findings.map((entry) => (
            <SeverityDot
              key={entry.finding.id}
              size="sm"
              tone={entry.status === 'open' ? SEVERITY_TONE[entry.finding.severity] : 'neutral'}
            />
          ))}
        </span>
        <a
          href={blobUrl(slug, sha, group.file)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${name} on GitHub`}
          className="focus-ring flex shrink-0 items-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <IconArrowUpRight className="size-3.5" stroke={1.75} />
        </a>
      </div>
      {isOpen &&
        group.findings.map((entry) => (
          <ReviewFinding
            key={entry.finding.id}
            entry={entry}
            lineUrl={
              entry.finding.line !== null
                ? blobUrl(slug, entry.reportedBy.headSha, entry.finding.file, entry.finding.line)
                : undefined
            }
            onToggle={() => onToggle(entry.finding, entry.status === 'dismissed')}
          />
        ))}
    </section>
  )
}
