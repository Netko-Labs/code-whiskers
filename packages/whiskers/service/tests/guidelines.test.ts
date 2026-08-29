import { describe, expect, test } from 'bun:test'
import { extractImports } from '../src/review/guidelines'

describe('extractImports', () => {
  test('finds @path .md imports like this repo’s CLAUDE.md uses', () => {
    const content =
      'Portable rules live in a reusable file imported here:\n\n@docs/conventions.md\n\nSee also @tasks/lessons.md inline.'
    expect(extractImports(content)).toEqual(['docs/conventions.md', 'tasks/lessons.md'])
  })

  test('ignores emails, handles, and non-md references', () => {
    const content =
      'mail me@example.com, mention @code-whiskers, and read @scripts/setup.sh for setup'
    expect(extractImports(content)).toEqual([])
  })

  test('empty content yields no imports', () => {
    expect(extractImports('')).toEqual([])
  })
})
