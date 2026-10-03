import { describe, expect, test } from 'bun:test'
import { chunkDiff, commentableLines } from './chunk'
import { diffFromFiles } from './files-diff'

const PATCH = '@@ -1,2 +1,3 @@\n const a = 1\n-const b = 2\n+const b = 3\n+const c = 4'

describe('diffFromFiles', () => {
  test('rebuilds a diff the line map and chunker read like the .diff format', () => {
    const diff = diffFromFiles([
      { filename: 'src/a.ts', status: 'modified', patch: PATCH },
      { filename: 'src/new.ts', status: 'added', patch: '@@ -0,0 +1 @@\n+export {}' },
      { filename: 'src/gone.ts', status: 'removed', patch: '@@ -1 +0,0 @@\n-export {}' },
    ])
    const lines = commentableLines(diff)
    expect([...(lines.get('src/a.ts') ?? [])]).toEqual([1, 2, 3])
    expect([...(lines.get('src/new.ts') ?? [])]).toEqual([1])
    expect(lines.has('src/gone.ts')).toBe(false)
    expect(chunkDiff(diff).join('')).toContain('diff --git a/src/new.ts b/src/new.ts')
  })

  test('keeps renames and files GitHub sent no patch for', () => {
    const diff = diffFromFiles([
      { filename: 'src/b.ts', previousFilename: 'src/old.ts', status: 'renamed', patch: PATCH },
      { filename: 'assets/blob.bin', status: 'added' },
    ])
    expect(diff).toContain(
      'rename from src/old.ts\nrename to src/b.ts\n--- a/src/old.ts\n+++ b/src/b.ts',
    )
    expect([...(commentableLines(diff).get('src/b.ts') ?? [])]).toEqual([1, 2, 3])
    expect(diff).toContain('diff --git a/assets/blob.bin b/assets/blob.bin\n[added; no patch')
  })
})
