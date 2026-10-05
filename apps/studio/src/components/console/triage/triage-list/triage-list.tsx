import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { DataListSkeleton } from '@/components/shared/data-list'
import { ScopePicker } from '../../scope-picker'
import { TRIAGE_TITLES } from '../../shared/console-data'
import { SetupChecklistCard } from '../../shared/setup-checklist'
import { matchesQuery, TRIAGE_FILTERS, type TriageListProps, useTriageKeys } from '../lib'
import { TriageRow } from './triage-row'

export function TriageList({ bucket, filter, items, selectedId, isLoading }: TriageListProps) {
  const [query, setQuery] = useState('')
  const heading = TRIAGE_TITLES[bucket]
  const shown = query ? items.filter((item) => matchesQuery(item, query)) : items
  useTriageKeys(shown, selectedId, bucket)

  return (
    <div className="flex min-w-[260px] shrink basis-[360px] flex-col border-border border-r">
      <div className="flex items-baseline justify-between gap-3 px-5 pt-5 pb-1">
        <h1 className="m-0 font-semibold text-[17px] tracking-[-0.015em]">{heading.title}</h1>
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {shown.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 border-border border-b px-5 py-3">
        <div className="flex gap-2">
          <ScopePicker className="max-w-[48%] shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter…"
            aria-label="Filter items"
            className="h-8 min-w-0 flex-1 rounded-[10px] border border-border bg-transparent px-2.5 text-[13px] outline-none placeholder:text-faint focus-visible:border-ring"
          />
        </div>
        <div className="flex gap-3.5 text-[12px]">
          {TRIAGE_FILTERS.map((option) => (
            <Link
              key={option.value}
              to="/console/triage/$bucket"
              params={{ bucket }}
              search={(prev) => ({ ...prev, filter: option.value })}
              className={cn(
                'transition-colors',
                option.value === filter
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {bucket === 'inbox' && <SetupChecklistCard className="mx-4 mt-3" />}

      <div className="flex flex-1 flex-col overflow-auto">
        {shown.map((item) => (
          <TriageRow key={item.id} bucket={bucket} item={item} active={item.id === selectedId} />
        ))}
        {isLoading && shown.length === 0 && <DataListSkeleton rows={6} />}
        {!isLoading && shown.length === 0 && (
          <p className="m-0 px-5 py-12 text-center text-muted-foreground text-ui">
            {query ? 'Nothing matches that filter.' : 'Nothing waiting here.'}
          </p>
        )}
      </div>
    </div>
  )
}
