import { postToStudio, readFromStudio } from './studio-client'
import type { MemoryContext, MemoryKind, MemoryNote } from './types'

/** Free text studio ranks notes against; long enough for a title and a page of file names. */
const QUERY_CHARS = 2_000
const RULES_BUDGET_CHARS = 1_600
const NOTES_BUDGET_CHARS = 2_000

const SECTIONS: { kind: MemoryKind; title: string }[] = [
  { kind: 'rule', title: 'Rules — a violation is a high-severity finding' },
  { kind: 'dont_flag', title: 'Do not flag — never report these, in any wording' },
  { kind: 'lesson', title: 'Lessons from earlier reviews — look harder here' },
  { kind: 'context', title: 'How this codebase works' },
  { kind: 'preference', title: 'Preferences — at most a low-severity suggestion' },
]

/** What the team and earlier reviews taught the reviewer about this repository. */
export async function fetchMemory(repo: string, title: string, files: string[]) {
  const q = [title, ...files].join(' ').slice(0, QUERY_CHARS)
  const { value } = await readFromStudio<MemoryNote[]>('memory', { repo, q }, [])
  return value
}

/** A note scoped to src/billing/** has nothing to say about a PR that never touches billing. */
export function memoryForFiles(notes: MemoryNote[], files: string[]): MemoryNote[] {
  return notes.filter((note) => {
    const scoped = note.paths.filter((path) => path !== '**' && path !== '*')
    if (scoped.length === 0) return true
    return scoped.some((path) => {
      const glob = new Bun.Glob(path)
      return files.some((file) => glob.match(file))
    })
  })
}

/** Narrower notes speak more directly to this diff: folder over repository over installation. */
function specificity(note: MemoryNote): number {
  return (note.paths.length > 0 ? 2 : 0) + (note.isRepositoryNote ? 1 : 0)
}

function lineOf(note: MemoryNote): string {
  const where = note.paths.length > 0 ? `(in ${note.paths.join(', ')}) ` : ''
  return `- ${where}${note.body.replace(/\s+/g, ' ').trim()}`
}

function fill(notes: MemoryNote[], budget: number): MemoryNote[] {
  const kept: MemoryNote[] = []
  let used = 0
  for (const note of notes) {
    const size = lineOf(note).length + 1
    if (used + size > budget) continue
    kept.push(note)
    used += size
  }
  return kept
}

/**
 * Rules ride with their own budget so ranking can never drop one a human wrote on purpose; the
 * rest compete for theirs, best full-text match and narrowest scope first.
 */
export function buildMemoryContext(notes: MemoryNote[]): MemoryContext {
  const rules = notes.filter((note) => note.kind === 'rule')
  const others = notes
    .filter((note) => note.kind !== 'rule')
    .sort((a, b) => b.rank - a.rank || specificity(b) - specificity(a))
  const kept = [...fill(rules, RULES_BUDGET_CHARS), ...fill(others, NOTES_BUDGET_CHARS)]
  if (kept.length === 0) return { text: '', noteIds: [], dropped: notes.length }

  const blocks = SECTIONS.map(({ kind, title }) => {
    const lines = kept.filter((note) => note.kind === kind).map(lineOf)
    return lines.length > 0 ? `### ${title}\n${lines.join('\n')}` : ''
  }).filter(Boolean)
  return {
    text: `## Team memory for this repository — follow it over your own defaults\n\n${blocks.join('\n\n')}`,
    noteIds: kept.map((note) => note.id),
    dropped: notes.length - kept.length,
  }
}

/** How often a note is read is how a human auditing memory tells signal from dead weight. */
export function markMemoryUsed(noteIds: string[]): void {
  if (noteIds.length > 0) void postToStudio('memory/used', { ids: noteIds })
}
