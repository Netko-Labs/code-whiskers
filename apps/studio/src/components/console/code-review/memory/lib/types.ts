import type { Tone } from '@/components/shared/status'
import type {
  MemoryActivity,
  MemoryKind,
  MemoryNote,
  Organization,
  Repository,
} from '@/integrations/studio-api'

export type MemoryTab = 'all' | MemoryKind | 'retired' | 'activity'

/** `id` set means editing that note; the installation is fixed once a note exists. */
export type NoteDraft = {
  id?: string
  kind: MemoryKind
  body: string
  installationId: string
  repositoryId: string
  paths: string
}

export type KindMeta = {
  label: string
  plural: string
  hint: string
  tone: Tone
}

export type MemoryState = {
  notes: MemoryNote[]
  organizations: Organization[]
  repositories: Repository[]
  counts: Record<Exclude<MemoryTab, 'activity'>, number>
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export type MemoryActions = {
  save: (draft: NoteDraft) => Promise<void>
  toggleRetired: (note: MemoryNote) => void
  remove: (note: MemoryNote) => void
}

export type ActivityState = {
  entries: MemoryActivity[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
  undo: (entry: MemoryActivity) => void
}

export type NoteFormState = {
  draft: NoteDraft
  error: string | null
  isSaving: boolean
  update: (patch: Partial<NoteDraft>) => void
  submit: () => Promise<boolean>
}

export type MemoryBodyProps = {
  state: MemoryState
  tab: MemoryTab
  onEdit: (draft: NoteDraft) => void
}

export type MemoryNoteRowProps = {
  note: MemoryNote
  onEdit: () => void
}

export type MemoryNoteDialogProps = {
  draft: NoteDraft | null
  organizations: Organization[]
  repositories: Repository[]
  onClose: () => void
}

export type NoteFormProps = {
  initial: NoteDraft
  organizations: Organization[]
  repositories: Repository[]
  onDone: () => void
}

export type KindPickerProps = {
  value: MemoryKind
  onChange: (kind: MemoryKind) => void
}

export type MemoryEmptyProps = {
  organizations: Organization[]
  onWrite: (draft: NoteDraft) => void
}

export type ActivityRowProps = {
  entry: MemoryActivity
  onUndo: () => void
}
