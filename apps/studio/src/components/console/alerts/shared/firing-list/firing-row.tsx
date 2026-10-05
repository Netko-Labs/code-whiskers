import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import {
  DataRow,
  DataRowDescription,
  DataRowLead,
  DataRowMeta,
  DataRowTitle,
  DataRowTrail,
} from '@/components/shared/data-list'
import { SeverityDot } from '@/components/shared/status'
import { formatAge, formatDateTime } from '@/shared/format-date'
import { DestinationIcon } from '../destination-icon'
import { FIRING_STATUS_LABEL, FIRING_TONE } from '../rule-copy'
import { type FiringRowProps, type FiringTarget, firingTarget, firstLine } from './lib'

function rowElement(target: FiringTarget) {
  if (target.kind === 'issue') {
    return <Link to="/console/issues/$issueId" params={{ issueId: target.issueId }} />
  }
  // DataRow clones the row's content into the element, so the anchor is never empty.
  if (target.kind === 'internal') return <a {...{ href: target.href }} />
  if (target.kind === 'external') {
    return <a {...{ href: target.href, target: '_blank', rel: 'noreferrer' }} />
  }
  return undefined
}

export function FiringRow({ firing, isRuleShown }: FiringRowProps) {
  const target = firingTarget(firing, typeof window === 'undefined' ? '' : window.location.origin)
  const tone = FIRING_TONE[firing.status]
  const detail = firstLine(firing.text)

  return (
    <DataRow
      tone={tone === 'error' ? 'error' : 'neutral'}
      density="auto"
      render={rowElement(target)}
    >
      <DataRowLead>
        <SeverityDot tone={tone} label={FIRING_STATUS_LABEL[firing.status]} />
      </DataRowLead>
      <span className="flex min-w-0 flex-1 flex-col">
        <DataRowTitle>{firing.title}</DataRowTitle>
        <DataRowDescription className="text-2xs">
          {isRuleShown ? `${firing.ruleName} · ${detail}` : detail}
        </DataRowDescription>
      </span>
      <DataRowTrail>
        <span className="flex items-center gap-1.5">
          {firing.deliveries.map((delivery) => (
            <span
              key={delivery.integrationId}
              title={delivery.error ? `${delivery.name}: ${delivery.error}` : delivery.name}
              className={cn('flex', !delivery.isDelivered && 'opacity-40')}
            >
              <DestinationIcon
                kind={delivery.kind}
                className={cn(!delivery.isDelivered && 'text-severity-error-ink')}
              />
            </span>
          ))}
          {firing.deliveries.length === 0 && (
            <span className="text-2xs text-severity-warning-ink">nowhere</span>
          )}
        </span>
        <DataRowMeta className="w-16 text-right">
          <time dateTime={firing.createdAt.toISOString()} title={formatDateTime(firing.createdAt)}>
            {formatAge(firing.createdAt)} ago
          </time>
        </DataRowMeta>
      </DataRowTrail>
    </DataRow>
  )
}
