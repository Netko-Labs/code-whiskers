import { describe, expect, test } from 'bun:test'
import { settingsLabelFor } from './settings'

describe('settingsLabelFor', () => {
  test('names settings tabs, ignoring a trailing slash', () => {
    expect(settingsLabelFor('/console/settings/api-keys')).toBe('API keys')
    expect(settingsLabelFor('/console/settings/account/')).toBe('Account')
  })

  test('pages the rail only links to are not settings tabs', () => {
    expect(settingsLabelFor('/console/projects')).toBeUndefined()
    expect(settingsLabelFor('/console/settings/nope')).toBeUndefined()
  })
})
