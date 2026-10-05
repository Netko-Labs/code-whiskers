import { Link } from '@tanstack/react-router'
import {
  DataList,
  DataRow,
  DataRowDescription,
  DataRowLead,
  DataRowMeta,
  DataRowTitle,
} from '@/components/shared/data-list'
import { Panel } from '@/components/shared/page'
import { LevelRule } from '../../shared/issue-ui'
import { ReleaseNote } from '../../shared/release-ui'
import type { ReleaseIssueListProps } from './lib'

export function ReleaseIssueList({ title, description, issues, empty }: ReleaseIssueListProps) {
  return (
    <Panel title={title} description={description} isFlush>
      {issues.length === 0 ? (
        <ReleaseNote className="px-4 py-3">{empty}</ReleaseNote>
      ) : (
        <DataList label={title}>
          {issues.map((issue) => (
            <DataRow
              key={issue.id}
              density="compact"
              render={<Link to="/console/issues/$issueId" params={{ issueId: issue.id }} />}
            >
              <DataRowLead>
                <LevelRule level={issue.level} className="h-4" />
              </DataRowLead>
              <DataRowTitle>{issue.title}</DataRowTitle>
              <DataRowDescription className="font-mono text-2xs">
                {issue.culprit ?? ''}
              </DataRowDescription>
              <DataRowMeta>{issue.eventCount.toLocaleString()}</DataRowMeta>
            </DataRow>
          ))}
        </DataList>
      )}
    </Panel>
  )
}
