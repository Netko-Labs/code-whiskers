import { describe, expect, test } from 'bun:test'
import { IconBug } from '@tabler/icons-react'
import { groupCommands, looksLikeIssueId } from './utils'

describe('looksLikeIssueId', () => {
  test('long single tokens are ids, titles are not', () => {
    expect(looksLikeIssueId('9f1c2b7e-41aa-4c55')).toBe(true)
    expect(looksLikeIssueId('TypeError cannot')).toBe(false)
    expect(looksLikeIssueId('short')).toBe(false)
  })
})

describe('groupCommands', () => {
  test('keeps the fixed group order and drops empty groups', () => {
    const run = () => {}
    const grouped = groupCommands([
      { id: 'a', group: 'Actions', label: 'Toggle theme', icon: IconBug, run },
      { id: 'g', group: 'Go to', label: 'Issues', icon: IconBug, run },
    ])
    expect(grouped.map((entry) => entry.group)).toEqual(['Go to', 'Actions'])
  })
})
