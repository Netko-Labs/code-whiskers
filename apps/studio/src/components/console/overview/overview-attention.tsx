import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import {
  DataList,
  DataListSkeleton,
  DataRow,
  DataRowDescription,
  DataRowLead,
  DataRowMeta,
  DataRowTitle,
  DataRowTrail,
} from '@/components/shared/data-list'
import { EmptyState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/page'
import { SeverityDot } from '@/components/shared/status'
import { reasonOf, SEVERITY_TONE } from '../shared/console-data'
import type { ConsoleItem } from '../shared/console-model'
import type { OverviewAttentionProps } from './lib'

function rowLink(item: ConsoleItem) {
  return item.issue ? (
    <Link to="/console/issues/$issueId" params={{ issueId: item.issue.id }} />
  ) : (
    <Link to="/console/triage/$bucket" params={{ bucket: 'inbox' }} search={{ sel: item.id }} />
  )
}

/** The loudest few things in the inbox; the inbox itself is one click away. */
export function OverviewAttention({ signals }: OverviewAttentionProps) {
  const { attention, isLoading } = signals

  return (
    <Panel
      title="Needs attention"
      description="Regressions, spikes, blocking reviews and firing alerts, loudest first"
      actions={
        <Link
          to="/console/triage/$bucket"
          params={{ bucket: 'inbox' }}
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          Open inbox
        </Link>
      }
      isFlush
      className="min-w-0 flex-1"
    >
      {isLoading ? (
        <DataListSkeleton rows={4} />
      ) : attention.length === 0 ? (
        <EmptyState
          size="inline"
          expression="sleeping"
          title="Nothing needs you"
          description="New, regressed and spiking issues and blocking reviews show up here first."
        />
      ) : (
        <DataList label="Needs attention" isDivided className="py-1">
          {attention.map((item) => (
            <DataRow key={item.id} tone={SEVERITY_TONE[item.severity]} render={rowLink(item)}>
              <DataRowLead>
                <SeverityDot tone={SEVERITY_TONE[item.severity]} label={item.label} />
              </DataRowLead>
              <DataRowTitle className="max-w-[55%]">{item.title}</DataRowTitle>
              <DataRowDescription>
                {item.scopeLabel} · {reasonOf(item)}
              </DataRowDescription>
              <DataRowTrail>
                <DataRowMeta>{item.age}</DataRowMeta>
              </DataRowTrail>
            </DataRow>
          ))}
        </DataList>
      )}
    </Panel>
  )
}
