import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { TRIAGE_TITLES } from '../../shared/console-data'
import {
  KEYBOARD_HINT,
  LIVE_NOTE,
  matchesQuery,
  TRIAGE_FILTERS,
  type TriageListProps,
  useTriageKeys,
} from '../lib'
import { TriageRow } from './triage-row'

export function TriageList({ bucket, filter, items, selectedId, sampleNote }: TriageListProps) {
  const [query, setQuery] = useState('')
  const heading = TRIAGE_TITLES[bucket]
  const shown = query ? items.filter((item) => matchesQuery(item, query)) : items
  useTriageKeys(shown, selectedId, bucket)

  return (
    <div className="flex min-w-[250px] shrink basis-[344px] flex-col border-border border-r">
      <div className="flex flex-col gap-3 border-border border-b px-[18px] pt-4 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="m-0 font-semibold text-[17px] tracking-[-0.01em]">{heading.title}</h1>
          <span className="text-muted-foreground text-xs">
            {shown.length} · {heading.sub}
          </span>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter…"
          aria-label="Filter items"
          className="h-8 rounded-[10px] border border-border bg-transparent px-2.5 text-[13px] shadow-sm outline-none placeholder:text-faint focus-visible:border-ring"
        />
        <div className="flex gap-1.5">
          {TRIAGE_FILTERS.map((option) => (
            <Link
              key={option.value}
              to="/console/triage/$bucket"
              params={{ bucket }}
              search={{ sel: selectedId, filter: option.value }}
              className={cn(
                'cursor-pointer rounded-lg border px-2.5 py-1 font-medium text-xs',
                option.value === filter
                  ? 'border-foreground bg-foreground text-primary-foreground'
                  : 'border-border bg-background text-body',
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-auto">
        {shown.map((item) => (
          <TriageRow key={item.id} bucket={bucket} item={item} active={item.id === selectedId} />
        ))}
      </div>

      <div className="flex items-center justify-between border-border border-t bg-surface-subtle px-[18px] py-[9px]">
        <span className="text-[11px] text-muted-foreground">{sampleNote || LIVE_NOTE}</span>
        <span className="font-mono text-[11px] text-faint">{KEYBOARD_HINT}</span>
      </div>
    </div>
  )
}
