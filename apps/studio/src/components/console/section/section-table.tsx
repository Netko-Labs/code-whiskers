import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { useRef } from 'react'
import { DataListSkeleton, useRovingFocus } from '@/components/shared/data-list'
import { SECTION_ROW, type SectionTableProps } from './lib'
import { SectionCell } from './section-cell'
import { SectionEmptyState } from './section-empty-state'
import { SectionRowActions } from './section-row-actions'

export function SectionTable({ table, minWidth, empty, isLoading }: SectionTableProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const onKeyDown = useRovingFocus(listRef)
  const grid = table.rowActions ? `${table.grid} max-content` : table.grid
  const style = { gridTemplateColumns: grid, minWidth: `${minWidth}px` }

  if (table.rows.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        {isLoading ? <DataListSkeleton rows={8} /> : <SectionEmptyState empty={empty} />}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div
        className="sticky top-0 z-[1] grid h-8 items-center gap-x-4 border-border border-b bg-background px-gutter"
        style={style}
      >
        {table.columns.map((column) => (
          <span
            key={column.label}
            className={cn(
              'flex whitespace-nowrap font-medium text-2xs text-muted-foreground',
              column.align === 'end' ? 'justify-end' : 'justify-start',
            )}
          >
            {column.label}
          </span>
        ))}
        {table.rowActions && <span />}
      </div>

      <div ref={listRef} role="list" onKeyDown={onKeyDown} className="stagger flex flex-col">
        {table.rows.map((row, index) => {
          const key = `${index}-${row[0]?.kind === 'text' ? row[0].text : index}`
          const actions = table.rowActions?.[index]
          const cells = [
            ...row.map((cell, cellIndex) => (
              <SectionCell key={`${cellIndex}-${cell.kind}`} cell={cell} />
            )),
            ...(table.rowActions
              ? [<SectionRowActions key="actions" actions={actions ?? []} />]
              : []),
          ]
          const link = table.rowLinks?.[index]
          const shared = { className: SECTION_ROW, style, 'data-slot': 'data-row' }
          return (
            <div key={key} role="listitem">
              {link?.kind === 'triage' ? (
                <Link
                  {...shared}
                  to="/console/triage/$bucket"
                  params={{ bucket: 'inbox' }}
                  search={{ sel: link.itemId }}
                >
                  {cells}
                </Link>
              ) : link?.kind === 'section' ? (
                <Link
                  {...shared}
                  to="/console/$section"
                  params={{ section: link.section }}
                  search={{ tab: link.tab ?? 0, ...link.filters }}
                >
                  {cells}
                </Link>
              ) : link?.kind === 'project' ? (
                <Link
                  {...shared}
                  to="/console/projects/$projectId"
                  params={{ projectId: link.projectId }}
                >
                  {cells}
                </Link>
              ) : link?.kind === 'project-setup' ? (
                <Link {...shared} to="/console/projects/new">
                  {cells}
                </Link>
              ) : link?.kind === 'external' ? (
                <a {...shared} href={link.href} target="_blank" rel="noreferrer">
                  {cells}
                </a>
              ) : (
                <div {...shared}>{cells}</div>
              )}
            </div>
          )
        })}
      </div>

      {table.footer && <p className="m-0 px-gutter py-4 text-2xs text-faint">{table.footer}</p>}
    </div>
  )
}
