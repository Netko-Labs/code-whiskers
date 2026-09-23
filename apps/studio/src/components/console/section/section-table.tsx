import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import type { SectionTableProps } from './lib'
import { SectionCell } from './section-cell'

const ROW = 'grid items-center gap-x-4 border-rule-soft border-b px-6 py-3 hover:bg-surface-subtle'

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

      {table.rows.map((row, index) => {
        const key = `${index}-${row[0]?.kind === 'text' ? row[0].text : index}`
        const className = cn(ROW, index % 2 === 1 ? 'bg-surface-alt' : 'bg-background')
        const cells = row.map((cell, cellIndex) => (
          <SectionCell key={`${cellIndex}-${cell.kind}`} cell={cell} />
        ))
        const link = table.rowLinks?.[index]
        if (link?.kind === 'triage') {
          return (
            <Link
              key={key}
              to="/console/triage/$bucket"
              params={{ bucket: 'inbox' }}
              search={{ sel: link.itemId }}
              className={className}
              style={style}
            >
              {cells}
            </Link>
          )
        }
        if (link?.kind === 'external') {
          return (
            <a
              key={key}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={className}
              style={style}
            >
              {cells}
            </a>
          )
        }
        return (
          <div key={key} className={className} style={style}>
            {cells}
          </div>
        )
      })}
    </div>
  )
}
