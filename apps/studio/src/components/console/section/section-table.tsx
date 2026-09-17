import { cn } from '@code-whiskers/ui/lib/utils'
import type { SectionTableProps } from './lib'
import { SectionCell } from './section-cell'

export function SectionTable({ table, minWidth }: SectionTableProps) {
  const style = { gridTemplateColumns: table.grid, minWidth: `${minWidth}px` }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div
        className="sticky top-0 z-[1] grid gap-x-4 border-border border-b bg-surface-subtle px-6 py-[9px]"
        style={style}
      >
        {table.columns.map((column) => (
          <span
            key={column.label}
            className={cn(
              'flex whitespace-nowrap font-medium text-[11px] text-muted-foreground',
              column.align === 'end' ? 'justify-end' : 'justify-start',
            )}
          >
            {column.label}
          </span>
        ))}
      </div>

      {table.rows.map((row, index) => (
        <div
          key={`${index}-${row[0]?.kind === 'text' ? row[0].text : index}`}
          className={cn(
            'grid items-center gap-x-4 border-rule-soft border-b px-6 py-3 hover:bg-surface-subtle',
            index % 2 === 1 ? 'bg-surface-alt' : 'bg-background',
          )}
          style={style}
        >
          {row.map((cell, cellIndex) => (
            <SectionCell key={`${cellIndex}-${cell.kind}`} cell={cell} />
          ))}
        </div>
      ))}
    </div>
  )
}
