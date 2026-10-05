import { cn } from '@code-whiskers/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { TELEMETRY_LEVELS, whiskersExplorerPatternsQuery } from '@/integrations/whiskers'
import type { ExplorerPartProps } from '../lib'
import { LogsEmpty } from '../logs-empty'
import { literalOf, PATTERN_GRID } from './lib'
import { PatternRow } from './pattern-row'

const HEADER = ['Lines', 'Trend', 'Pattern', 'Service', 'Last']

/** Lines grouped by shape, every level unless the level filter narrows it. */
export function LogsPatterns({ explorer }: ExplorerPartProps) {
  const levels = explorer.filter.levels?.length ? explorer.filter.levels : [...TELEMETRY_LEVELS]
  const { data, isPending, isError, refetch } = useQuery({
    ...whiskersExplorerPatternsQuery({ ...explorer.filter, levels }, explorer.window),
    retry: false,
  })
  const [openHash, setOpenHash] = useState<string | null>(null)
  const patterns = data ?? []

  if (isPending) return <DataListSkeleton rows={10} />
  if (isError) return <ErrorState size="inline" onRetry={() => void refetch()} />
  if (patterns.length === 0) {
    return explorer.isFiltered ? (
      <EmptyState size="inline" expression="sleeping" title="No patterns match" />
    ) : (
      <LogsEmpty explorer={explorer} />
    )
  }

  return (
    <section aria-label="Log patterns" className="flex flex-col">
      <div
        aria-hidden
        className={cn(
          'grid gap-x-4 border-border border-b px-gutter py-1.5 text-2xs text-faint',
          PATTERN_GRID,
        )}
      >
        {HEADER.map((label, index) => (
          <span key={label} className={cn((index === 0 || index === 4) && 'text-right')}>
            {label}
          </span>
        ))}
      </div>
      <div role="list" aria-label="Log patterns" className="stagger">
        {patterns.map((pattern) => (
          <PatternRow
            key={pattern.hash}
            pattern={pattern}
            isExpanded={openHash === pattern.hash}
            onToggle={(hash) => setOpenHash((current) => (current === hash ? null : hash))}
            onShowLines={(chosen) =>
              explorer.update({
                view: undefined,
                service: chosen.service,
                q: literalOf(chosen.pattern),
              })
            }
          />
        ))}
      </div>
      <p className="m-0 px-gutter py-3 text-2xs text-faint">
        Grouped from the newest 5,000 matching lines; ids, numbers and quoted values are folded.
      </p>
    </section>
  )
}
