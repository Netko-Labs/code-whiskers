import { cn } from '@code-whiskers/ui/lib/utils'
import { useRef } from 'react'
import { type DataListProps, useRovingFocus } from './lib'

export function DataList({
  children,
  label,
  isAnimated = true,
  isDivided = false,
  className,
}: DataListProps) {
  const ref = useRef<HTMLDivElement>(null)
  const onKeyDown = useRovingFocus(ref)

  return (
    <div
      ref={ref}
      role="list"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        'flex flex-col',
        isAnimated && 'stagger',
        isDivided && 'divide-y divide-rule-soft',
        className,
      )}
    >
      {children}
    </div>
  )
}
