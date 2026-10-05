import { IconPencil, IconTrash } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { formatAge } from '@/shared/format-date'
import {
  destinationOf,
  ICON_BUTTON,
  ROW_LINK,
  type SavedQueryLinkProps,
  type SavedQueryRowProps,
  SECTION_LABEL,
  summaryOf,
} from './lib'

/** Opening a view lands on its page with every filter it was saved with. */
function SavedQueryLink({ saved, className, children }: SavedQueryLinkProps) {
  const destination = destinationOf(saved)
  if (destination.section === 'live-logs') {
    return (
      <Link
        to="/console/live-logs"
        search={destination.search}
        data-slot="data-row"
        className={className}
      >
        {children}
      </Link>
    )
  }
  if (destination.section === 'traces') {
    return (
      <Link
        to="/console/traces"
        search={destination.search}
        data-slot="data-row"
        className={className}
      >
        {children}
      </Link>
    )
  }
  return (
    <Link
      to="/console/$section"
      params={{ section: 'issues' }}
      search={destination.search}
      data-slot="data-row"
      className={className}
    >
      {children}
    </Link>
  )
}

export function SavedQueryRow({ saved, onRename, onDelete }: SavedQueryRowProps) {
  const summary = summaryOf(destinationOf(saved))

  return (
    <div
      role="listitem"
      className="group/row relative flex min-h-row items-center gap-3 border-rule-soft border-b px-gutter transition-colors duration-fast hover:bg-surface-hover"
    >
      <SavedQueryLink saved={saved} className={ROW_LINK}>
        <span className="w-14 shrink-0 rounded-sm border border-border px-1.5 py-0.5 text-center text-2xs text-muted-foreground">
          {SECTION_LABEL[saved.section]}
        </span>
        <span className="min-w-0 shrink-0 truncate font-medium text-foreground text-ui">
          {saved.name}
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-2xs text-muted-foreground">
          {summary}
        </span>
        <span className="shrink-0 font-mono text-2xs text-faint tabular-nums">
          {formatAge(saved.createdAt)} ago
        </span>
      </SavedQueryLink>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover/row:opacity-100">
        <button
          type="button"
          aria-label={`Rename ${saved.name}`}
          onClick={() => onRename(saved)}
          className={ICON_BUTTON}
        >
          <IconPencil className="size-3.5" stroke={1.75} />
        </button>
        <button
          type="button"
          aria-label={`Delete ${saved.name}`}
          onClick={() => onDelete(saved)}
          className={`${ICON_BUTTON} hover:text-severity-error-ink`}
        >
          <IconTrash className="size-3.5" stroke={1.75} />
        </button>
      </div>
    </div>
  )
}
