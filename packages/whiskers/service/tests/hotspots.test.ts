import { describe, expect, test } from 'bun:test'
import { directoryOf } from '../src/queries/insights'

describe('directoryOf', () => {
  test('keeps the first three directory levels', () => {
    expect(directoryOf('apps/studio/src/components/console/x.tsx')).toBe('apps/studio/src')
  })

  test('a shallow file keeps what it has', () => {
    expect(directoryOf('packages/cli/index.ts')).toBe('packages/cli')
  })

  test('a root file sits in the root', () => {
    expect(directoryOf('README.md')).toBe('.')
  })
})
