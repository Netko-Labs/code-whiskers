import { cn } from '@code-whiskers/ui/lib/utils'
import type { CodeHunkProps } from './lib'

const SIGN_STYLE = {
  '+': { row: 'bg-severity-resolved/10', sign: 'text-severity-resolved' },
  '-': { row: 'bg-severity-error/10', sign: 'text-severity-error' },
  '': { row: '', sign: 'text-faint' },
} as const

export function CodeHunk({ lines, numberWidth = '44px' }: CodeHunkProps) {
  return (
    <div className="overflow-x-auto font-mono text-xs leading-5">
      {lines.map((line, index) => {
        const style = SIGN_STYLE[line.sign]
        return (
          <div
            // Hunks are static and can repeat a line number across a +/− pair.
            key={`${line.no}-${line.sign}-${index}`}
            className={cn('grid gap-1.5 px-3', style.row)}
            style={{ gridTemplateColumns: `${numberWidth} 14px 1fr` }}
          >
            <span className="text-right text-faint">{line.no}</span>
            <span className={style.sign}>{line.sign}</span>
            <span
              className={cn('whitespace-pre', line.sign === '' ? 'text-body' : 'text-foreground')}
            >
              {line.text}
            </span>
          </div>
        )
      })}
    </div>
  )
}
