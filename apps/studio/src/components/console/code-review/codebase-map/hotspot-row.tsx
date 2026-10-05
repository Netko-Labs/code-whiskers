import { cn } from '@code-whiskers/ui/lib/utils'
import { IconFolder } from '@tabler/icons-react'
import { DataRow, DataRowLead, DataRowMeta, DataRowTrail } from '@/components/shared/data-list'
import { TONE_DOT } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { countsLabel } from '../shared/review-model'
import { type HotspotRowProps, treeUrl } from './lib'

/** A directory and one stacked bar: its findings by severity, on the page's shared scale. */
export function HotspotRow({ row }: HotspotRowProps) {
  const { spot } = row

  return (
    <DataRow
      density="auto"
      tone={row.blocking > 0 ? 'error' : 'neutral'}
      render={<a href={treeUrl(spot)} target="_blank" rel="noreferrer" />}
    >
      <DataRowLead>
        <IconFolder stroke={1.75} />
      </DataRowLead>
      <span className="flex w-[38%] min-w-0 shrink-0 flex-col gap-0.5">
        <span className="truncate font-medium font-mono text-xs">
          {spot.directory === '.' ? '(root)' : spot.directory}
        </span>
        <span className="truncate text-2xs text-muted-foreground">
          <span className="font-mono">{spot.repository}</span>
          <span className="text-faint"> · </span>
          {spot.owners.length > 0 ? (
            <span className="font-mono">{spot.owners.join(' ')}</span>
          ) : (
            <span className="text-faint">no owner</span>
          )}
        </span>
      </span>
      <span
        role="img"
        aria-label={countsLabel(spot)}
        title={countsLabel(spot)}
        className="flex h-2 min-w-0 flex-1 gap-px overflow-hidden rounded-full"
      >
        {row.segments.map((segment) => (
          <span
            key={segment.key}
            style={{ width: `${segment.percent}%` }}
            className={cn(
              'h-full animate-enter first:rounded-l-full last:rounded-r-full',
              TONE_DOT[segment.tone],
            )}
          />
        ))}
      </span>
      <DataRowTrail>
        <DataRowMeta className="w-10 text-right text-foreground">{spot.findings}</DataRowMeta>
        <DataRowMeta className="hidden w-16 text-right md:block">
          {spot.pullRequests} {spot.pullRequests === 1 ? 'PR' : 'PRs'}
        </DataRowMeta>
        <DataRowMeta className="hidden w-10 text-right sm:block">
          {formatAge(spot.lastSeen)}
        </DataRowMeta>
      </DataRowTrail>
    </DataRow>
  )
}
