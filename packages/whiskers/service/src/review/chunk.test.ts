import { describe, expect, test } from 'bun:test'
import { chunkDiff } from './chunk'

const section = (file: string, body = '+x\n') =>
  `diff --git a/${file} b/${file}\n--- a/${file}\n+++ b/${file}\n@@ -0,0 +1 @@\n${body}`

describe('chunkDiff', () => {
  test('drops generated, binary and lock files', () => {
    const diff =
      section('src/a.ts') +
      section('bun.lock') +
      section('src/routeTree.gen.ts') +
      section('public/favicon.svg') +
      section('apps/x/dist/index.js') +
      section('src/b.ts')
    const chunks = chunkDiff(diff)
    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toContain('src/a.ts')
    expect(chunks[0]).toContain('src/b.ts')
    expect(chunks[0]).not.toContain('bun.lock')
    expect(chunks[0]).not.toContain('routeTree.gen.ts')
    expect(chunks[0]).not.toContain('favicon.svg')
    expect(chunks[0]).not.toContain('dist/index.js')
  })

  test('packs sections greedily under the size cap', () => {
    const big = section('src/big.ts', `+${'y'.repeat(50)}\n`)
    const chunks = chunkDiff(big + big + big, big.length * 2)
    expect(chunks).toHaveLength(2)
  })
})
