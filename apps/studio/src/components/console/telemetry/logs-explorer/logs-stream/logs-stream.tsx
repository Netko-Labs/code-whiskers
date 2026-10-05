import { cn } from '@code-whiskers/ui/lib/utils'
import { useState } from 'react'
import { DataListSkeleton } from '@/components/shared/data-list'
import { ErrorState } from '@/components/shared/empty-state'
import type { ExplorerPartProps } from '../lib'
import { LogsEmpty } from '../logs-empty'
import { STREAM_GRID, useLiveTail, useLogStream } from './lib'
import { LogRow } from './log-row'
import { LogsStreamFooter, NewLinesPill } from './stream-parts'

const HEADER = ['Time', 'Level', 'Service', 'Message']

export function LogsStream({ explorer }: ExplorerPartProps) {
  const stream = useLogStream(explorer)
  const tail = useLiveTail(stream.lines, explorer.isLive)
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(new Set())

  const toggle = (id: number) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })
  const filterBy = (key: string, value: string) =>
    explorer.update({ attrs: { ...explorer.search.attrs, [key]: value } })

  return (
    <section aria-label="Log lines" className="relative flex min-w-0 flex-col">
      <div ref={tail.sentinelRef} aria-hidden className="h-px" />
      <NewLinesPill count={tail.pending} onShow={tail.showNew} />
      <div
        aria-hidden
        className={cn(
          'grid gap-x-3 border-border border-b px-gutter py-1.5 text-2xs text-faint',
          STREAM_GRID,
        )}
      >
        {HEADER.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      {stream.isPending ? (
        <DataListSkeleton rows={14} density="compact" />
      ) : stream.isError ? (
        <ErrorState size="inline" onRetry={stream.retry} />
      ) : tail.visible.length === 0 && tail.pending === 0 ? (
        <LogsEmpty explorer={explorer} />
      ) : (
        <>
          <div role="list" aria-label="Log lines" aria-live={explorer.isLive ? 'polite' : 'off'}>
            {tail.visible.map((line) => (
              <LogRow
                key={line.id}
                line={line}
                isFresh={line.id > tail.freshAfter}
                isExpanded={expanded.has(line.id)}
                onToggle={toggle}
                onFilter={filterBy}
              />
            ))}
          </div>
          <LogsStreamFooter
            shown={tail.visible.length}
            hasMore={stream.hasMore}
            isLoadingMore={stream.isLoadingMore}
            onLoadMore={stream.loadMore}
          />
        </>
      )}
    </section>
  )
}
