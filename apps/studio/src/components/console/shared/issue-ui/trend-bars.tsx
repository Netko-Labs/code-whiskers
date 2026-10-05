import { cn } from '@code-whiskers/ui/lib/utils'
import { barHeights, type TrendBarsProps } from './lib'

/** Event counts as bars, oldest left; an empty bucket keeps a hairline so gaps read as quiet. */
export function TrendBars({ values, labels, className }: TrendBarsProps) {
  const heights = barHeights(values)

  return (
    <span className={cn('flex h-4 items-end gap-px', className)}>
      {heights.map((height, index) => (
        <span
          key={index}
          title={labels?.[index]}
          className={cn(
            'min-w-px flex-1 rounded-[1px]',
            height === 0 ? 'h-px bg-border' : 'bg-severity-info/70',
          )}
          style={height === 0 ? undefined : { height: `${height}%` }}
        />
      ))}
    </span>
  )
}
