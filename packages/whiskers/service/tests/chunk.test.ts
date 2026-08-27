import { describe, expect, test } from 'bun:test'
import { chunkDiff, commentableLines } from '../src/review/chunk'

const fileDiff = (name: string, body = '+added line') =>
  `diff --git a/${name} b/${name}\nindex 000..111 100644\n--- a/${name}\n+++ b/${name}\n@@ -0,0 +1,1 @@\n${body}\n`

describe('chunkDiff', () => {
  test('drops lockfiles and minified noise', () => {
    const diff = fileDiff('src/app.ts') + fileDiff('bun.lock') + fileDiff('dist/x.min.js')
    const chunks = chunkDiff(diff)
    expect(chunks.join('')).toContain('src/app.ts')
    expect(chunks.join('')).not.toContain('bun.lock')
    expect(chunks.join('')).not.toContain('x.min.js')
  })

  test('packs greedily under the budget', () => {
    const diff = fileDiff('a.ts') + fileDiff('b.ts') + fileDiff('c.ts')
    expect(chunkDiff(diff, 10_000)).toHaveLength(1)
    expect(chunkDiff(diff, fileDiff('a.ts').length + 10)).toHaveLength(3)
  })
})

describe('commentableLines', () => {
  test('maps added lines on the new side', () => {
    const lines = commentableLines(fileDiff('src/app.ts'))
    expect(lines.get('src/app.ts')?.has(1)).toBe(true)
    expect(lines.get('src/app.ts')?.has(99)).toBeFalsy()
  })
})
