import { useNavigate } from '@tanstack/react-router'
import { DataList, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { Page, PageHeader, PageTabs } from '@/components/shared/page'
import { formatAge } from '@/shared/format-date'
import { shortRelease } from '../../shared/issue-lifecycle'
import {
  RELEASE_TABS,
  RELEASES_DESCRIPTION,
  RELEASES_TITLE,
  type ReleaseListProps,
  useReleaseList,
} from './lib'
import { ReleaseListEmpty } from './release-list-empty'
import { ReleaseListHead } from './release-list-head'
import { ReleaseListRow } from './release-list-row'
import { ReleaseListToolbar } from './release-list-toolbar'

/** Sentry's release table with Vercel's deploy column: newest first, filters in the URL. */
export function ReleaseList({ tab, filters }: ReleaseListProps) {
  const list = useReleaseList(tab, filters)
  const navigate = useNavigate()
  const latest = list.inScope[0]
  const hasManyProjects = new Set(list.inScope.map((release) => release.projectId)).size > 1
  const tabs = RELEASE_TABS.map((label, index) => ({
    key: label,
    label,
    count:
      index === 0
        ? list.inScope.length
        : list.inScope.filter((release) => release.newIssues > 0).length,
    isActive: tab === index,
    onSelect: () =>
      void navigate({
        to: '/console/$section',
        params: { section: 'releases' },
        search: { ...filters, tab: index },
        replace: true,
      }),
  }))

  return (
    <Page>
      <PageHeader
        title={RELEASES_TITLE}
        description={RELEASES_DESCRIPTION}
        meta={
          latest && (
            <span className="animate-enter">
              Latest{' '}
              <span className="font-mono text-foreground">{shortRelease(latest.release)}</span> ·
              first seen {formatAge(latest.firstSeen)} ago
            </span>
          )
        }
        tabs={list.inScope.length > 0 && <PageTabs label="Release filter" items={tabs} />}
      />
      {list.inScope.length > 0 && (
        <ReleaseListToolbar tab={tab} filters={filters} facets={list.facets} />
      )}
      {list.isLoading ? (
        <DataListSkeleton />
      ) : list.isError ? (
        <ErrorState
          title="Releases did not load"
          description="Whiskers did not answer."
          onRetry={list.retry}
        />
      ) : list.inScope.length === 0 ? (
        <ReleaseListEmpty projects={list.projects} />
      ) : list.releases.length === 0 ? (
        <EmptyState size="inline" expression="sleeping" title="No matches" />
      ) : (
        <>
          <ReleaseListHead />
          <DataList label="Releases">
            {list.releases.map((release) => (
              <ReleaseListRow
                key={release.id}
                release={release}
                projectName={list.projectName(release.projectId)}
                hasProjectColumn={hasManyProjects}
              />
            ))}
          </DataList>
          <p className="m-0 px-gutter py-3 text-2xs text-faint">
            An issue is new in the release of its first event. Newest 100 releases.
          </p>
        </>
      )}
    </Page>
  )
}
