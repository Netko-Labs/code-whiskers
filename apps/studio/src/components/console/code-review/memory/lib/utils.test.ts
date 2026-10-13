import { describe, expect, test } from 'bun:test'
import type { MemoryActivity, MemoryNote } from '@/integrations/studio-api'
import {
  canUndo,
  describeActivity,
  draftError,
  draftOf,
  inputOf,
  isOnTab,
  newDraft,
  parsePaths,
  sortNotes,
  whereOf,
} from './utils'

function note(id: string, over: Partial<MemoryNote> = {}): MemoryNote {
  return {
    id,
    installationId: 7,
    organization: 'acme',
    repositoryId: null,
    repository: null,
    kind: 'context',
    body: 'Storefront pages are public',
    paths: [],
    source: 'human',
    sourceUrl: null,
    authorName: null,
    status: 'active',
    uses: 0,
    lastUsedAt: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...over,
  }
}

describe('memory drafts', () => {
  test('a new note is org-wide context in the first installation', () => {
    expect(newDraft([])).toMatchObject({ kind: 'context', repositoryId: '', installationId: '' })
  })

  test('folders split on commas and lines', () => {
    expect(parsePaths('src/billing/**, docs/**\n\n *.md ')).toEqual([
      'src/billing/**',
      'docs/**',
      '*.md',
    ])
  })

  test('round-trips a note into the API shape', () => {
    const draft = draftOf(note('a', { repositoryId: 42, paths: ['src/**'] }))
    expect(inputOf(draft)).toEqual({
      installationId: 7,
      repositoryId: 42,
      kind: 'context',
      body: 'Storefront pages are public',
      paths: ['src/**'],
    })
    expect(inputOf({ ...draft, repositoryId: '' }).repositoryId).toBeNull()
  })

  test('validation mirrors studio', () => {
    const draft = { ...draftOf(note('a')), id: undefined }
    expect(draftError(draft)).toBeNull()
    expect(draftError({ ...draft, body: 'ok' })).toMatch(/sentence/)
    expect(draftError({ ...draft, paths: Array(11).fill('a').join(',') })).toMatch(/folders/)
    expect(draftError({ ...draft, installationId: '' })).toMatch(/organization/)
  })
})

describe('memory list', () => {
  test('retired notes only show on their tab', () => {
    const retired = note('r', { status: 'retired', kind: 'rule' })
    expect(isOnTab(retired, 'all')).toBe(false)
    expect(isOnTab(retired, 'rule')).toBe(false)
    expect(isOnTab(retired, 'retired')).toBe(true)
    expect(isOnTab(note('c'), 'context')).toBe(true)
  })

  test('rules first, then the most used', () => {
    const sorted = sortNotes([note('c1'), note('c2', { uses: 5 }), note('r', { kind: 'rule' })])
    expect(sorted.map((n) => n.id)).toEqual(['r', 'c2', 'c1'])
  })

  test('says where a note applies', () => {
    expect(whereOf(note('a'))).toBe('all of acme')
    expect(whereOf(note('b', { repository: 'acme/shop', paths: ['src/**'] }))).toBe(
      'acme/shop · src/**',
    )
  })
})

describe('memory activity', () => {
  const entry = (over: Partial<MemoryActivity> = {}): MemoryActivity => ({
    id: 'e',
    installationId: 7,
    organization: 'acme',
    noteId: 'n',
    action: 'created',
    actorName: 'whiskers',
    before: null,
    after: { kind: 'lesson', body: 'OTP must check the owner', status: 'active' },
    undoneAt: null,
    createdAt: new Date(0),
    ...over,
  })

  test('reads as a sentence', () => {
    expect(describeActivity(entry())).toBe('whiskers added a lesson')
  })

  test('an undo or an undone change cannot be undone again', () => {
    expect(canUndo(entry())).toBe(true)
    expect(canUndo(entry({ undoneAt: new Date() }))).toBe(false)
    expect(canUndo(entry({ action: 'undone' }))).toBe(false)
  })
})
