import { Checkbox } from '@code-whiskers/ui/components/checkbox'
import { cn } from '@code-whiskers/ui/lib/utils'
import { ISSUE_COLUMNS, ISSUE_GRID, type IssueListHeadProps } from './lib'

export function IssueListHead({ selectedCount, rowCount, onToggleAll }: IssueListHeadProps) {
  const isAll = rowCount > 0 && selectedCount === rowCount

  return (
    <div
      className="sticky top-0 z-[2] grid items-center gap-x-4 border-border border-b bg-background px-8 py-2"
      style={{ gridTemplateColumns: ISSUE_GRID }}
    >
      <Checkbox
        aria-label="Select every row"
        checked={isAll}
        indeterminate={selectedCount > 0 && !isAll}
        disabled={rowCount === 0}
        onCheckedChange={onToggleAll}
      />
      <span className="font-medium text-[12px] text-muted-foreground">
        {selectedCount > 0 ? `${selectedCount} selected` : 'Issue'}
      </span>
      {ISSUE_COLUMNS.map((column) => (
        <span
          key={column.label}
          className={cn(
            'whitespace-nowrap font-medium text-[12px] text-muted-foreground',
            column.align === 'end' && 'text-right',
          )}
        >
          {column.label}
        </span>
      ))}
      <span />
    </div>
  )
}
