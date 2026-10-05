import { describe, expect, test } from 'bun:test'
import type { Member } from '@/integrations/studio-api'
import { assigneeAriaLabel, assigneeText } from './utils'

const MARA: Member = {
  id: 'u1',
  name: 'Mara Ito',
  image: null,
  organizations: [],
  lastSyncedAt: new Date(0),
}

describe('assign trigger label', () => {
  test('unassigned reads Assign', () => {
    expect(assigneeText(undefined, null)).toBe('Assign')
    expect(assigneeAriaLabel(undefined, null)).toBe('Assign')
  })

  test('an assignee shows by name, and says the control changes it', () => {
    expect(assigneeText(MARA, 'u1')).toBe('Mara Ito')
    expect(assigneeAriaLabel(MARA, 'u1')).toBe('Assigned to Mara Ito — change assignee')
  })

  test('an assignee whose name has not loaded still reads as assigned', () => {
    expect(assigneeText(undefined, 'u1')).toBe('Assigned')
    expect(assigneeAriaLabel(undefined, 'u1')).toBe('Assigned to a teammate — change assignee')
  })
})
