import { describe, expect, test } from 'bun:test'
import { buildMemoryContext, memoryForFiles } from './memory'
import type { MemoryNote } from './types'

const note = (overrides: Partial<MemoryNote> = {}): MemoryNote => ({
  id: crypto.randomUUID(),
  kind: 'context',
  body: 'Storefront pages are public and need no login.',
  paths: [],
  isRepositoryNote: true,
  rank: 0,
  ...overrides,
})

describe('memoryForFiles', () => {
  test('keeps notes for everywhere and for touched folders only', () => {
    const everywhere = note()
    const billing = note({ kind: 'rule', paths: ['src/billing/**'] })
    const docs = note({ paths: ['docs/**', '*.md'] })
    expect(memoryForFiles([everywhere, billing, docs], ['src/web/app.tsx'])).toEqual([everywhere])
    expect(memoryForFiles([everywhere, billing, docs], ['src/billing/cents.ts'])).toEqual([
      everywhere,
      billing,
    ])
    expect(memoryForFiles([docs], ['README.md'])).toEqual([docs])
  })

  test('treats a catch-all glob like no scope', () => {
    const all = note({ paths: ['**'] })
    expect(memoryForFiles([all], ['anything/at/all.ts'])).toEqual([all])
  })
})

describe('buildMemoryContext', () => {
  test('is empty without notes', () => {
    expect(buildMemoryContext([])).toEqual({ text: '', noteIds: [], applied: [], dropped: 0 })
  })

  test('groups notes by kind, rules first, with their scope', () => {
    const rule = note({ kind: 'rule', body: 'Money is integer cents.', paths: ['src/billing/**'] })
    const quiet = note({ kind: 'dont_flag', body: 'Apple Wallet scales icons.' })
    const { text, noteIds } = buildMemoryContext([quiet, rule])
    expect(text.indexOf('### Rules')).toBeLessThan(text.indexOf('### Do not flag'))
    expect(text).toContain('- (in src/billing/**) Money is integer cents.')
    expect(text).toContain('- Apple Wallet scales icons.')
    expect(noteIds).toEqual([rule.id, quiet.id])
  })

  test('never lets ranked notes push out a rule', () => {
    const rules = Array.from({ length: 3 }, (_, at) => note({ kind: 'rule', body: `Rule ${at}.` }))
    const noise = Array.from({ length: 200 }, (_, at) =>
      note({ body: `A long context note number ${at} `.repeat(4), rank: 1 }),
    )
    const { text, noteIds, dropped } = buildMemoryContext([...noise, ...rules])
    for (const rule of rules) expect(noteIds).toContain(rule.id)
    expect(dropped).toBeGreaterThan(0)
    expect(text.length).toBeLessThan(4_000)
  })

  test('prefers the best match, then the narrowest scope', () => {
    const org = note({ body: 'Org-wide note.', isRepositoryNote: false })
    const folder = note({ body: 'Folder note.', paths: ['src/**'] })
    const matched = note({ body: 'Matched note.', isRepositoryNote: false, rank: 0.4 })
    const { noteIds } = buildMemoryContext([org, folder, matched])
    expect(noteIds).toEqual([matched.id, folder.id, org.id])
  })
})
