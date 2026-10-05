import { cn } from '@code-whiskers/ui/lib/utils'
import { IconGitCommit } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import {
  DataRow,
  DataRowDescription,
  DataRowLead,
  DataRowMeta,
  DataRowTitle,
} from '@/components/shared/data-list'
import { Sparkline } from '@/components/shared/stats'
import { SeverityDot, TONE_INK } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { shortRelease } from '../../shared/issue-lifecycle'
import { COLUMN, newIssueTone, type ReleaseListRowProps, SPARK_HEIGHT, SPARK_WIDTH } from './lib'
import { ReleaseEnvChips } from './release-env-chips'

export function ReleaseListRow({ release, projectName, hasProjectColumn }: ReleaseListRowProps) {
  const tone = newIssueTone(release)
  const deploy = release.lastDeploy

  return (
    <DataRow
      tone={tone === 'error' ? 'error' : 'neutral'}
      render={
        <Link
          to="/console/releases/$version"
          params={{ version: release.release }}
          search={{ project: release.projectId }}
        />
      }
    >
      <DataRowLead>
        <SeverityDot tone={tone} label={tone === 'neutral' ? undefined : 'Brought new issues'} />
      </DataRowLead>
      <DataRowTitle className="font-mono">
        <span title={release.release}>{shortRelease(release.release)}</span>
      </DataRowTitle>
      <DataRowDescription>{hasProjectColumn ? projectName : null}</DataRowDescription>
      <span className={cn('hidden lg:flex', COLUMN.envs)}>
        <ReleaseEnvChips release={release} />
      </span>
      <DataRowMeta className={cn(COLUMN.newIssues, release.newIssues > 0 && TONE_INK[tone])}>
        <span title={`${release.newIssues} new issues, ${release.newErrors} of them errors`}>
          {release.newIssues > 0 ? `+${release.newIssues}` : '0'}
        </span>
      </DataRowMeta>
      <span className={cn('hidden items-center gap-2 md:flex', COLUMN.events)}>
        <Sparkline
          values={release.trend}
          variant="bars"
          width={SPARK_WIDTH}
          height={SPARK_HEIGHT}
          tone="info"
          label={`${release.events.toLocaleString()} events`}
        />
      </span>
      <DataRowMeta className={cn('hidden md:inline-flex md:justify-end', COLUMN.commits)}>
        {release.commitCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <IconGitCommit className="size-3" stroke={1.75} />
            {release.commitCount}
          </span>
        )}
      </DataRowMeta>
      <span
        className={cn('hidden truncate text-2xs text-muted-foreground xl:block', COLUMN.deployed)}
      >
        {deploy
          ? `${deploy.name ?? deploy.environment} · ${formatAge(deploy.deployedAt)} ago`
          : 'not deployed'}
      </span>
      <DataRowMeta className={COLUMN.age}>{formatAge(release.firstSeen)}</DataRowMeta>
    </DataRow>
  )
}
