import type {
  MemoryActivity,
  MemoryNote,
  MemoryNoteInput,
  Organization,
} from '@/integrations/studio-api'
import type { MemoryTab, NoteDraft } from './types'
import {
  ACTION_VERB,
  BODY_MAX,
  BODY_MIN,
  KIND_META,
  KIND_ORDER,
  PATH_MAX,
  PATHS_MAX,
  WHOLE_INSTALLATION,
} from './values'

export function newDraft(
  organizations: Organization[],
  seed: Partial<Omit<NoteDraft, 'id'>> = {},
): NoteDraft {
  return {
    kind: 'context',
    body: '',
    installationId: String(organizations[0]?.installationId ?? ''),
    repositoryId: WHOLE_INSTALLATION,
    paths: '',
    ...seed,
  }
}

export function draftOf(note: MemoryNote): NoteDraft {
  return {
    id: note.id,
    kind: note.kind,
    body: note.body,
    installationId: String(note.installationId),
    repositoryId: note.repositoryId === null ? WHOLE_INSTALLATION : String(note.repositoryId),
    paths: note.paths.join(', '),
  }
}

/** Folders as typed: commas or new lines between globs, blanks dropped. */
export function parsePaths(text: string): string[] {
  return text
    .split(/[,\n]/)
    .map((path) => path.trim())
    .filter(Boolean)
}

/** The same limits studio's schema enforces, said before the round trip. */
export function draftError(draft: NoteDraft): string | null {
  const body = draft.body.trim()
  const paths = parsePaths(draft.paths)
  if (body.length < BODY_MIN) return 'Write the note as a sentence or two'
  if (body.length > BODY_MAX) return `Keep the note under ${BODY_MAX} characters`
  if (paths.length > PATHS_MAX) return `Name at most ${PATHS_MAX} folders`
  if (paths.some((path) => path.length > PATH_MAX)) return 'One of the folders is too long'
  if (!draft.id && !draft.installationId) return 'Pick the organization the note belongs to'
  return null
}

export function inputOf(draft: NoteDraft): MemoryNoteInput {
  return {
    installationId: Number(draft.installationId),
    repositoryId: draft.repositoryId === WHOLE_INSTALLATION ? null : Number(draft.repositoryId),
    kind: draft.kind,
    body: draft.body.trim(),
    paths: parsePaths(draft.paths),
  }
}

export function isOnTab(note: MemoryNote, tab: MemoryTab): boolean {
  if (tab === 'retired') return note.status === 'retired'
  if (note.status === 'retired') return false
  return tab === 'all' || tab === note.kind
}

/** Rules first, then by kind; within a kind the most used lead. */
export function sortNotes(notes: MemoryNote[]): MemoryNote[] {
  return [...notes].sort(
    (a, b) =>
      KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
      b.uses - a.uses ||
      b.updatedAt.getTime() - a.updatedAt.getTime(),
  )
}

/** Where a note applies, said the way a person would. */
export function whereOf(note: Pick<MemoryNote, 'organization' | 'repository' | 'paths'>): string {
  const base = note.repository ?? `all of ${note.organization}`
  return note.paths.length > 0 ? `${base} · ${note.paths.join(', ')}` : base
}

/** "Whiskers added a lesson" — one line per change in the activity feed. */
export function describeActivity(entry: MemoryActivity): string {
  const snapshot = entry.after ?? entry.before
  const kind = snapshot ? KIND_META[snapshot.kind].label.toLowerCase() : 'note'
  return `${entry.actorName ?? 'Someone'} ${ACTION_VERB[entry.action]} a ${kind}`
}

export function canUndo(entry: MemoryActivity): boolean {
  return entry.undoneAt === null && entry.action !== 'undone'
}
