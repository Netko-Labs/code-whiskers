import { cn } from '@code-whiskers/ui/lib/utils'
import { useCountUp } from '@/shared/motion'
import { type CountUpProps, formatInteger } from './lib'

/** A number that rolls to its new value; assistive tech reads only the final one. */
export function CountUp({ value, format = formatInteger, className }: CountUpProps) {
  const shown = useCountUp(value)

  return (
    <span className={cn('tabular-nums', className)}>
      <span aria-hidden>{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  )
}
