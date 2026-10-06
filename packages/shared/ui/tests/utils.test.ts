import { describe, expect, test } from 'bun:test'
import { cn } from '../src/lib/utils'

describe('cn', () => {
  test('a token font size survives a text colour beside it', () => {
    expect(cn('text-nav', 'text-sidebar-foreground')).toBe('text-nav text-sidebar-foreground')
    expect(cn('text-ui text-muted-foreground')).toBe('text-ui text-muted-foreground')
  })

  test('two sizes still resolve to the last one', () => {
    expect(cn('text-ui', 'text-2xs')).toBe('text-2xs')
    expect(cn('shadow-raised', 'shadow-overlay')).toBe('shadow-overlay')
  })
})
