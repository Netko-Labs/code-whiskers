import type { memoryActivity, memoryNote } from '@code-whiskers/studio-domain'

type Note = typeof memoryNote.$inferSelect

export interface MemoryNoteRecord {
  id: string
  installationId: number
  organization: string
  repositoryId: number | null
  repository: string | null
  kind: Note['kind']
  body: string
  paths: string[]
  source: Note['source']
  sourceUrl: string | null
  authorName: string | null
  status: Note['status']
  uses: number
  lastUsedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface MemoryActivityRecord {
  id: string
  installationId: number
  organization: string
  noteId: string
  action: (typeof memoryActivity.$inferSelect)['action']
  actorName: string | null
  before: unknown
  after: unknown
  undoneAt: Date | null
  createdAt: Date
}

/** What the reviewer gets: no authorship, ranked against the pull request when asked. */
export interface RepositoryMemoryNote {
  id: string
  kind: Note['kind']
  body: string
  paths: string[]
  isRepositoryNote: boolean
  rank: number
}

export interface RepositoryRef {
  id: number
  installationId: number
}
