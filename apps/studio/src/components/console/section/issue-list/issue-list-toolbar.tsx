import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { ScopePicker } from '../../scope-picker'
import { SectionSearchBox } from '../section-search-box'
import { IssueFilterBar } from './issue-filter-bar'
import { ISSUE_TABS, type IssueListToolbarProps, useIssueCounts } from './lib'

export function IssueListToolbar({
  section,
  tab,
  filters,
  params,
  isSample,
}: IssueListToolbarProps) {
  const counts = useIssueCounts(params, isSample)

  return (
    <div className="flex shrink-0 flex-col border-border border-b px-8">
      <div className="flex items-center gap-5">
        <ScopePicker className="my-2.5 max-w-[220px]" />
        {section === 'issues' && (
          <nav className="flex items-center gap-5 self-stretch">
            {ISSUE_TABS.map((option, index) => (
              <Link
                key={option.status}
                to="/console/$section"
                params={{ section }}
                search={{ ...filters, tab: index }}
                className={cn(
                  '-mb-px flex items-center gap-1.5 border-b-2 py-3 text-[13px] transition-colors',
                  index === tab
                    ? 'border-foreground font-medium text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                  {counts[option.status]?.toLocaleString() ?? ''}
                </span>
              </Link>
            ))}
          </nav>
        )}
        <SectionSearchBox
          section={section}
          tab={tab}
          filters={filters}
          placeholder="Search issue titles…"
        />
      </div>
      <IssueFilterBar section={section} tab={tab} filters={filters} />
    </div>
  )
}
