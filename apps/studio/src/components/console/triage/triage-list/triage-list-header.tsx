import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { ToolbarSearch } from '@/components/shared/toolbar'
import { ScopePicker } from '../../scope-picker'
import { TRIAGE_TITLES } from '../../shared/console-data'
import { TRIAGE_FILTERS, type TriageListHeaderProps } from '../lib'

export function TriageListHeader({ bucket, filter, count, query, onQuery }: TriageListHeaderProps) {
  const heading = TRIAGE_TITLES[bucket]

  return (
    <div className="flex shrink-0 flex-col gap-3 border-border border-b px-gutter pt-5 pb-3">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="m-0 font-semibold text-foreground text-title">{heading.title}</h1>
        <span
          key={count}
          className="animate-enter font-mono text-2xs text-muted-foreground tabular-nums"
        >
          {count.toLocaleString()}
        </span>
      </div>
      <div className="flex gap-2">
        <ScopePicker className="max-w-[48%] shrink-0" />
        <ToolbarSearch
          value={query}
          onValueChange={onQuery}
          placeholder="Filter…"
          className="w-auto min-w-0 flex-1"
        />
      </div>
      <nav aria-label="Kind" className="flex flex-wrap gap-x-3.5 gap-y-1 text-2xs">
        {TRIAGE_FILTERS.map((option) => (
          <Link
            key={option.value}
            to="/console/triage/$bucket"
            params={{ bucket }}
            search={(prev) => ({ ...prev, filter: option.value, sel: undefined })}
            aria-current={option.value === filter ? 'page' : undefined}
            className={cn(
              'focus-ring rounded-sm transition-colors duration-fast',
              option.value === filter
                ? 'font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
