import { cn } from '@code-whiskers/ui/lib/utils'
import { DESTINATION_ICONS, DESTINATION_LABELS, type DestinationIconProps } from './lib'

/** Monochrome brand marks: color is for severity, never for a vendor. */
export function DestinationIcon({ kind, className, isLabelled }: DestinationIconProps) {
  const Icon = DESTINATION_ICONS[kind] ?? DESTINATION_ICONS.webhook
  const label = DESTINATION_LABELS[kind] ?? kind
  return (
    <Icon
      className={cn('size-3.5 shrink-0 text-muted-foreground', className)}
      stroke={1.75}
      aria-label={isLabelled ? label : undefined}
      aria-hidden={isLabelled ? undefined : true}
    />
  )
}
