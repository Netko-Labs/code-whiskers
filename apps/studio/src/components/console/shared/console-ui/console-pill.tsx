import { cn } from '@code-whiskers/ui/lib/utils'
import { type ConsolePillProps, PILL_TONE } from './lib'

export function ConsolePill({ tone, children, className }: ConsolePillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-[3px] text-[11px] font-semibold',
        PILL_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
