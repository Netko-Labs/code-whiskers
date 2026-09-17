import { cn } from '@code-whiskers/ui/lib/utils'
import { SEVERITY_BG, type SeverityDotProps } from './lib'

export function SeverityDot({ severity, size = 'md', className }: SeverityDotProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'shrink-0 rounded-full',
        size === 'sm' ? 'size-1.5' : 'size-[7px]',
        SEVERITY_BG[severity],
        className,
      )}
    />
  )
}
