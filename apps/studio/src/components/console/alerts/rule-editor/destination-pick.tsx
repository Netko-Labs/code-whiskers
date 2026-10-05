import { Button } from '@code-whiskers/ui/components/button'
import { Checkbox } from '@code-whiskers/ui/components/checkbox'
import { Spinner } from '@code-whiskers/ui/components/spinner'
import { IconSend } from '@tabler/icons-react'
import { formatAge } from '@/shared/format-date'
import { DestinationIcon } from '../shared/destination-icon'
import type { DestinationPickProps } from './lib'

export function DestinationPick({
  destination,
  isChosen,
  isTesting,
  isPickable,
  onToggle,
  onTest,
}: DestinationPickProps) {
  const id = `destination-${destination.id}`
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      {isPickable && <Checkbox id={id} checked={isChosen} onCheckedChange={onToggle} />}
      <DestinationIcon kind={destination.kind} isLabelled />
      <label htmlFor={isPickable ? id : undefined} className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-foreground text-ui">{destination.name}</span>
        <span className="truncate font-mono text-2xs text-muted-foreground">
          {destination.lastError ? (
            <span className="text-severity-error-ink">{destination.lastError}</span>
          ) : destination.lastDeliveredAt ? (
            `${destination.urlHost} · delivered ${formatAge(destination.lastDeliveredAt)} ago`
          ) : (
            `${destination.urlHost} · never delivered`
          )}
        </span>
      </label>
      <Button size="xs" variant="ghost" onClick={onTest} disabled={isTesting} type="button">
        {isTesting ? <Spinner className="size-3" /> : <IconSend stroke={1.75} />}
        Send test
      </Button>
    </div>
  )
}
