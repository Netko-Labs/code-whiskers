import { cn } from '@code-whiskers/ui/lib/utils'
import { IconChevronRight, IconFileCode } from '@tabler/icons-react'
import { useState } from 'react'
import { FindingCard } from './finding-card'
import { type ReviewFileGroupProps, SEVERITY_DOT, splitPath } from './lib'

export function ReviewFileGroup({
  group,
  fileUrl,
  lineUrl,
  isDismissed,
  onToggle,
}: ReviewFileGroupProps) {
  const [isOpen, setOpen] = useState(true)
  const { directory, name } = splitPath(group.file)

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center gap-2 bg-surface-subtle px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen(!isOpen)}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <IconChevronRight
            className={cn(
              'size-3.5 shrink-0 text-muted-foreground transition-transform',
              isOpen && 'rotate-90',
            )}
          />
          <IconFileCode className="size-4 shrink-0 text-muted-foreground" stroke={1.75} />
          <span className="min-w-0 truncate font-mono text-[12px]" title={group.file}>
            <span className="text-muted-foreground">{directory}</span>
            <span className="font-semibold">{name}</span>
          </span>
        </button>
        <span className="flex shrink-0 items-center gap-1">
          {group.findings.map((finding) => (
            <span
              key={finding.id}
              className={cn(
                'size-[7px] rounded-full',
                isDismissed(finding) ? 'bg-rule-strong' : SEVERITY_DOT[finding.severity],
              )}
            />
          ))}
        </span>
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-rule-soft hover:text-foreground"
          >
            File ↗
          </a>
        )}
      </div>
      {isOpen &&
        group.findings.map((finding) => {
          const dismissed = isDismissed(finding)
          return (
            <FindingCard
              key={finding.id}
              finding={finding}
              isDismissed={dismissed}
              url={lineUrl(finding)}
              onToggle={() => onToggle(finding, dismissed)}
            />
          )
        })}
    </section>
  )
}
