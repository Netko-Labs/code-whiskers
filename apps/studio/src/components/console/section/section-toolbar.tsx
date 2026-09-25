import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { ScopePicker } from '../scope-picker'
import type { SectionToolbarProps } from './lib'
import { SectionSearchBox } from './section-search-box'

export function SectionToolbar({ section, tab, filters, definition }: SectionToolbarProps) {
  const hasSearch = !!(definition.searchPlaceholder || filters.service)
  const hasTabs = definition.tabs.length > 1
  if (!definition.isScoped && !hasTabs && !hasSearch) return null

  return (
    <div className="flex shrink-0 items-center gap-5 border-border border-b px-8">
      {definition.isScoped && <ScopePicker className="my-2.5 max-w-[220px]" />}
      {hasTabs && (
        <nav className="flex items-center gap-5 self-stretch">
          {definition.tabs.map((label, index) => (
            <Link
              key={label}
              to="/console/$section"
              params={{ section }}
              search={{ ...filters, tab: index }}
              className={cn(
                '-mb-px flex items-center border-b-2 py-3 text-[13px] transition-colors',
                index === tab
                  ? 'border-foreground font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
      {hasSearch && (
        <SectionSearchBox
          section={section}
          tab={tab}
          filters={filters}
          placeholder={definition.searchPlaceholder ?? 'Search…'}
        />
      )}
    </div>
  )
}
