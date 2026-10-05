import { cn } from '@code-whiskers/ui/lib/utils'
import { cloneElement } from 'react'
import { TONE_RULE } from '@/components/shared/status'
import { DATA_ROW, type DataRowProps, ROW_DENSITY, ROW_RULE } from './lib'

/** Without `render` the row is static text; give it a link or button to make it focusable. */
export function DataRow({
  render,
  isSelected = false,
  tone = 'neutral',
  density = 'default',
  className,
  children,
}: DataRowProps) {
  const rowClass = cn(
    DATA_ROW,
    ROW_DENSITY[density],
    tone !== 'neutral' && cn(ROW_RULE, TONE_RULE[tone]),
    className,
  )
  const state = {
    'data-slot': 'data-row',
    'data-selected': isSelected ? 'true' : undefined,
    'aria-current': isSelected ? ('true' as const) : undefined,
  }

  return (
    <div role="listitem" className="min-w-0">
      {render ? (
        cloneElement(render, {
          ...state,
          className: cn(rowClass, render.props.className),
          children,
        })
      ) : (
        <div {...state} className={rowClass}>
          {children}
        </div>
      )}
    </div>
  )
}
