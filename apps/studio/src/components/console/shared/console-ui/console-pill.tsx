import { cn } from '@code-whiskers/ui/lib/utils'
import { type ConsolePillProps, PILL_DOT } from './lib'

export function ConsolePill({ tone, children, className }: ConsolePillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap text-[13px]',
        tone === 'neutral' ? 'text-muted-foreground' : 'text-foreground',
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', PILL_DOT[tone])} />
      {children}
    </span>
  )
}
