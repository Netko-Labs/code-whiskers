import { cn } from '@code-whiskers/ui/lib/utils'
import { type SeverityDotProps, TONE_DOT } from './lib'

export function SeverityDot({
  tone,
  size = 'md',
  isPulsing = false,
  label,
  className,
}: SeverityDotProps) {
  const dot = (
    <>
      {isPulsing && (
        <span className={cn('absolute inset-0 animate-live rounded-full', TONE_DOT[tone])} />
      )}
      <span className={cn('relative size-full rounded-full', TONE_DOT[tone])} />
    </>
  )
  const frame = cn(
    'relative inline-flex shrink-0',
    size === 'sm' ? 'size-1.5' : 'size-2',
    className,
  )

  return label ? (
    <span role="img" aria-label={label} className={frame}>
      {dot}
    </span>
  ) : (
    <span aria-hidden className={frame}>
      {dot}
    </span>
  )
}
