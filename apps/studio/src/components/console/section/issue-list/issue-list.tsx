import { useQueryClient } from '@tanstack/react-query'
import { savedQueriesQuery } from '@/integrations/studio-api'
import { saveViewAction } from '../lib'
import { SectionHeader } from '../section-header'
import { IssueBulkPill } from './issue-bulk-pill'
import { IssueListFooter } from './issue-list-footer'
import { IssueListHead } from './issue-list-head'
import { IssueListRow } from './issue-list-row'
import { IssueListToolbar } from './issue-list-toolbar'
import {
  EMPTY_WORDS,
  ISSUE_LIST_MIN_WIDTH,
  ISSUES_SUBTITLE,
  ISSUES_TITLE,
  type IssueListProps,
  REGRESSIONS_SUBTITLE,
  REGRESSIONS_TITLE,
  UNREACHABLE_NOTE,
  useIssueList,
  useIssueSelection,
} from './lib'

export function IssueList({ section, tab, filters }: IssueListProps) {
  const list = useIssueList(section, tab, filters)
  const selection = useIssueSelection(list.rows)
  const queryClient = useQueryClient()
  const isRegressions = section === 'regressions'
  const selected = list.rows.filter((issue) => selection.ids.has(issue.id))
  const status = list.params.status

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <SectionHeader
        definition={{
          title: isRegressions ? REGRESSIONS_TITLE : ISSUES_TITLE,
          subtitle: isRegressions ? REGRESSIONS_SUBTITLE : ISSUES_SUBTITLE,
          stats: [],
          sample: list.isSample,
          note: list.isUnreachable ? UNREACHABLE_NOTE : null,
          actions: isRegressions
            ? []
            : [
                saveViewAction('issues', tab, filters, () =>
                  queryClient.invalidateQueries({ queryKey: savedQueriesQuery().queryKey }),
                ),
              ],
        }}
      />
      <IssueListToolbar
        section={section}
        tab={tab}
        filters={filters}
        params={list.params}
        isSample={list.isSample}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <div style={{ minWidth: `${ISSUE_LIST_MIN_WIDTH}px` }}>
          <IssueListHead
            selectedCount={selected.length}
            rowCount={list.rows.length}
            onToggleAll={selection.toggleAll}
          />
          {list.rows.map((issue) => (
            <IssueListRow
              key={issue.id}
              issue={issue}
              project={list.projectNames.get(issue.projectId) ?? 'Sample project'}
              hasStatus={status === 'all'}
              isSelected={selection.ids.has(issue.id)}
              onToggle={selection.toggle}
            />
          ))}
          {list.rows.length === 0 && !list.isLoading && (
            <p className="m-0 px-8 py-16 text-center text-[13px] text-muted-foreground">
              {isRegressions ? 'Nothing you resolved has come back.' : EMPTY_WORDS[status]}
            </p>
          )}
          <IssueListFooter
            shown={list.rows.length}
            total={list.total}
            hasMore={list.hasMore}
            isLoadingMore={list.isLoadingMore}
            onLoadMore={list.loadMore}
          />
        </div>
      </div>
      {selected.length > 0 && <IssueBulkPill issues={selected} onDone={selection.clear} />}
    </div>
  )
}
