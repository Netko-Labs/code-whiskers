import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { Section } from '@/components/shared/page'
import { groupByFile, shortSha } from '../shared/review-model'
import { FindingFilterBar } from './finding-filter-bar'
import {
  FIX_HINT,
  type ReviewFindingsProps,
  type SeverityFilter,
  type StatusFilter,
  visibleFindings,
} from './lib'
import { ReviewFile } from './review-file'

export function ReviewFindings({ data, actions }: ReviewFindingsProps) {
  const [status, setStatus] = useState<StatusFilter>('open')
  const [severity, setSeverity] = useState<SeverityFilter>('all')
  const { basis, selected, findings, slug } = data

  if (!basis) {
    return (
      <Section title="Findings">
        <p className="m-0 text-muted-foreground text-ui">
          {selected.status === 'failed'
            ? 'No findings: this push was not reviewed. Run it again from the header.'
            : 'Findings appear here once the first push is reviewed.'}
        </p>
      </Section>
    )
  }

  const groups = groupByFile(visibleFindings(findings, status, severity))
  const isOwnPush = basis.id === selected.id

  return (
    <Section
      title="Findings"
      description={
        isOwnPush
          ? undefined
          : `As of ${shortSha(basis.headSha)}, the last push Whiskers finished reading`
      }
    >
      <FindingFilterBar
        findings={findings}
        status={status}
        severity={severity}
        onStatus={(next) => {
          setStatus(next)
          setSeverity('all')
        }}
        onSeverity={setSeverity}
      />
      {groups.length === 0 ? (
        <EmptyState
          size="inline"
          expression={findings.length === 0 ? 'approved' : 'sleeping'}
          title={findings.length === 0 ? 'Nothing to fix' : 'Nothing here'}
          description={
            findings.length === 0
              ? 'Whiskers found nothing on this push.'
              : 'No finding has this status or severity.'
          }
          className="rounded-xl border border-border border-dashed"
        />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {groups.map((group) => (
            <ReviewFile
              key={group.file}
              group={group}
              slug={slug}
              sha={basis.headSha}
              onToggle={actions.toggleFinding}
            />
          ))}
        </div>
      )}
      {status === 'open' && groups.length > 0 && (
        <p className="m-0 text-2xs text-faint">{FIX_HINT}</p>
      )}
    </Section>
  )
}
