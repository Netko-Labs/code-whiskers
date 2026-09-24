import { cn } from '@code-whiskers/ui/lib/utils'
import { useState } from 'react'
import type { ConsoleItem, ErrorTab } from '../../../shared/console-model'
import { LogLines, StackTrace } from '../../../shared/console-ui'
import { ERROR_TABS, useIssueEvidence } from '../../lib'
import { ErrorBreadcrumbs } from './error-breadcrumbs'
import { ErrorTags } from './error-tags'

export function ErrorDetail({ item }: { item: ConsoleItem }) {
  const [tab, setTab] = useState<ErrorTab>('stack')
  const evidence = useIssueEvidence(item)
  const meta = ERROR_TABS.find((entry) => entry.value === tab)?.meta ?? ''

  return (
    <div className="flex min-h-[260px] flex-1 flex-col overflow-hidden rounded-2xl border border-border">
      <div className="flex flex-wrap items-center gap-1 border-border border-b bg-surface-subtle px-3 py-2">
        {ERROR_TABS.map((entry) => (
          <button
            type="button"
            key={entry.value}
            onClick={() => setTab(entry.value)}
            className={cn(
              'rounded-lg px-2.5 py-[5px] text-xs',
              tab === entry.value
                ? 'bg-background font-semibold text-foreground'
                : 'font-medium text-muted-foreground',
            )}
          >
            {entry.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">{meta}</span>
      </div>

      {tab === 'stack' && (
        <StackTrace title={item.title} frames={evidence.frames} hiddenNote={evidence.hiddenNote} />
      )}
      {tab === 'crumbs' && <ErrorBreadcrumbs crumbs={evidence.crumbs} />}
      {tab === 'logs' && <LogLines lines={evidence.logs} className="flex-1 overflow-auto" />}
      {tab === 'tags' && <ErrorTags tags={evidence.tags} />}
      {evidence.isLoading && (
        <span className="px-4 py-3 text-muted-foreground text-xs">Reading the newest event…</span>
      )}
    </div>
  )
}
