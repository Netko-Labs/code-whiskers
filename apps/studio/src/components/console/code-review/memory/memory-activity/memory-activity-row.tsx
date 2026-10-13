import { Button } from '@code-whiskers/ui/components/button'
import { DataRow, DataRowLead, DataRowTrail } from '@/components/shared/data-list'
import { SeverityDot } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { type ActivityRowProps, canUndo, describeActivity, KIND_META } from '../lib'

export function MemoryActivityRow({ entry, onUndo }: ActivityRowProps) {
  const note = entry.after ?? entry.before
  const wasEdited = entry.action === 'edited' && entry.before && entry.after

  return (
    <DataRow density="auto" className="items-start py-3">
      <DataRowLead className="mt-1.5">
        <SeverityDot tone={note ? KIND_META[note.kind].tone : 'neutral'} size="sm" />
      </DataRowLead>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-foreground text-ui">
          {describeActivity(entry)}
          <span className="text-muted-foreground"> · {entry.organization}</span>
        </span>
        {wasEdited && entry.before?.body !== entry.after?.body ? (
          <span className="flex flex-col gap-0.5 text-2xs">
            <del className="text-muted-foreground">{entry.before?.body}</del>
            <ins className="text-foreground no-underline">{entry.after?.body}</ins>
          </span>
        ) : (
          note && <span className="text-pretty text-2xs text-muted-foreground">“{note.body}”</span>
        )}
      </span>
      <DataRowTrail className="mt-0.5 gap-3">
        <span className="text-2xs text-faint">{formatAge(entry.createdAt)} ago</span>
        {canUndo(entry) ? (
          <Button size="sm" variant="outline" onClick={onUndo}>
            Undo
          </Button>
        ) : (
          <span className="text-2xs text-faint">{entry.undoneAt ? 'Undone' : ''}</span>
        )}
      </DataRowTrail>
    </DataRow>
  )
}
