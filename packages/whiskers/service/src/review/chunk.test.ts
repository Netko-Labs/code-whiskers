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

  test('drops vendored, bulk-data and release-plumbing files', () => {
    const diff =
      section('src/keep.ts') +
      section('vendor/lib/thing.go') +
      section('third_party/x.js') +
      section('locales/es.po') +
      section('fixtures/rows.csv') +
      section('CHANGELOG.md') +
      section('api/schema.pb.go')
    const chunks = chunkDiff(diff)
    expect(chunks[0]).toContain('src/keep.ts')
    for (const noise of ['vendor/lib', 'third_party', 'es.po', 'rows.csv', 'CHANGELOG', 'pb.go']) {
      expect(chunks[0]).not.toContain(noise)
    }
  })

  test('keeps migrations and workflows reviewable', () => {
    const diff =
      section('packages/studio/repository/src/db/drizzle/0002_x.sql') +
      section('.github/workflows/ci.yml')
    const chunks = chunkDiff(diff)
    expect(chunks[0]).toContain('0002_x.sql')
    expect(chunks[0]).toContain('ci.yml')
  })

  test('elides a single oversized file instead of dropping it', () => {
    const huge = section('src/data.ts', `+${'z'.repeat(20_000)}\n`)
    const chunks = chunkDiff(huge + section('src/small.ts'))
    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toContain('src/data.ts')
    expect(chunks[0]).toContain('too large to review inline')
    expect(chunks[0]).not.toContain('zzzz')
    expect(chunks[0]).toContain('src/small.ts')
  })

  test('packs sections greedily under the size cap', () => {
    const big = section('src/big.ts', `+${'y'.repeat(50)}\n`)
    const chunks = chunkDiff(big + big + big, big.length * 2)
    expect(chunks).toHaveLength(2)
  })
})
