import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link, useNavigate } from '@tanstack/react-router'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { Page, PageBody, PageHeaderSkeleton, PanelSkeleton } from '@/components/shared/page'
import { MISSING_RELEASE, type ReleasePageProps, type ReleaseTab, useReleaseDetail } from './lib'
import { ReleaseCommits } from './release-commits'
import { ReleaseDeploys } from './release-deploys'
import { ReleaseHeader } from './release-header'
import { ReleaseOverview } from './release-overview'

export function ReleasePage({ version, projectId, tab }: ReleasePageProps) {
  const { detail, project, isMissing, isError, retry } = useReleaseDetail(projectId, version)
  const navigate = useNavigate()
  const onTab = (next: ReleaseTab) =>
    void navigate({
      to: '/console/releases/$version',
      params: { version },
      search: { project: projectId, tab: next },
      replace: true,
    })

  if (isMissing) {
    return (
      <EmptyState
        expression="confused"
        title="Release not found"
        description={MISSING_RELEASE}
        action={
          <Link
            to="/console/$section"
            params={{ section: 'releases' }}
            search={{ tab: 0 }}
            className={buttonVariants({ size: 'sm', variant: 'outline' })}
          >
            All releases
          </Link>
        }
      />
    )
  }
  if (isError) return <ErrorState title="The release did not load" onRetry={retry} />
  if (!detail) {
    return (
      <Page>
        <PageHeaderSkeleton />
        <PageBody width="full">
          <PanelSkeleton rows={4} />
        </PageBody>
      </Page>
    )
  }

  return (
    <Page>
      <ReleaseHeader detail={detail} projectName={project?.name ?? null} tab={tab} onTab={onTab} />
      <PageBody width="full" key={tab} className="animate-enter">
        {tab === 'overview' && <ReleaseOverview detail={detail} />}
        {tab === 'commits' && <ReleaseCommits detail={detail} />}
        {tab === 'deploys' && <ReleaseDeploys detail={detail} project={project} />}
      </PageBody>
    </Page>
  )
}
