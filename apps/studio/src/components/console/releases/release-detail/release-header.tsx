import { Link } from '@tanstack/react-router'
import { PageHeader, PageTabs } from '@/components/shared/page'
import { formatAge } from '@/shared/format-date'
import { shortRelease } from '../../shared/issue-lifecycle'
import { commitUrl, shortSha } from '../../shared/release-ui'
import { META_LINK, RELEASE_TAB_LABELS, RELEASE_TABS, type ReleaseHeaderProps } from './lib'

export function ReleaseHeader({ detail, projectName, tab, onTab }: ReleaseHeaderProps) {
  const { release, repository, previousVersion } = detail
  const counts = {
    overview: undefined,
    commits: detail.commits.length,
    deploys: detail.deploys.filter((deploy) => deploy.isThisRelease).length,
  }
  const sha = release.commitSha

  return (
    <PageHeader
      title={
        <span className="font-mono" title={release.version}>
          {shortRelease(release.version)}
        </span>
      }
      meta={
        <>
          {projectName && <span>{projectName}</span>}
          <span>first seen {formatAge(release.firstSeen)} ago</span>
          {repository && sha && (
            <a
              href={commitUrl(repository, sha)}
              target="_blank"
              rel="noreferrer"
              className={META_LINK}
            >
              {shortSha(sha)}
            </a>
          )}
          {repository && <span className="font-mono">{repository}</span>}
          {previousVersion && (
            <span>
              after{' '}
              <Link
                to="/console/releases/$version"
                params={{ version: previousVersion }}
                search={{ project: release.projectId, tab }}
                className={META_LINK}
              >
                {shortRelease(previousVersion)}
              </Link>
            </span>
          )}
        </>
      }
      tabs={
        <PageTabs
          label="Release sections"
          items={RELEASE_TABS.map((key) => ({
            key,
            label: RELEASE_TAB_LABELS[key],
            count: counts[key],
            isActive: key === tab,
            onSelect: () => onTab(key),
          }))}
        />
      }
    />
  )
}
