import { Button } from '@code-whiskers/ui/components/button'
import { Spinner } from '@code-whiskers/ui/components/spinner'
import { IconSend, IconTrash } from '@tabler/icons-react'
import {
  DataRow,
  DataRowDescription,
  DataRowLead,
  DataRowMeta,
  DataRowTitle,
  DataRowTrail,
} from '@/components/shared/data-list'
import { formatAge } from '@/shared/format-date'
import { DestinationIcon } from '../shared/destination-icon'
import type { DestinationRowProps } from './lib'

function DeliveryState({ destination }: Pick<DestinationRowProps, 'destination'>) {
  if (destination.lastError) {
    return (
      <span
        className="max-w-[240px] truncate text-2xs text-severity-error-ink"
        title={destination.lastError}
      >
        {destination.lastError}
      </span>
    )
  }
  return (
    <DataRowMeta>
      {destination.lastDeliveredAt
        ? `delivered ${formatAge(destination.lastDeliveredAt)} ago`
        : 'never delivered'}
    </DataRowMeta>
  )
}

export function DestinationRow({
  destination,
  isTesting,
  isOrgShown,
  onTest,
  onRemove,
}: DestinationRowProps) {
  return (
    <DataRow tone={destination.lastError ? 'error' : 'neutral'}>
      <DataRowLead>
        <DestinationIcon kind={destination.kind} isLabelled className="size-4" />
      </DataRowLead>
      <DataRowTitle>{destination.name}</DataRowTitle>
      <DataRowDescription className="font-mono text-2xs">
        {destination.urlHost}
        {isOrgShown && ` · ${destination.organization}`}
      </DataRowDescription>
      <DataRowTrail>
        <DeliveryState destination={destination} />
        <Button size="xs" variant="outline" onClick={onTest} disabled={isTesting}>
          {isTesting ? <Spinner className="size-3" /> : <IconSend stroke={1.75} />}
          Send test
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={onRemove}
          aria-label={`Remove ${destination.name}`}
        >
          <IconTrash stroke={1.75} />
        </Button>
      </DataRowTrail>
    </DataRow>
  )
}
