import { describe, expect, test } from 'bun:test'
import { isApprovalStanding } from './review-state'

describe('isApprovalStanding', () => {
  test('a ruleset dismissed the approval on push', () => {
    expect(isApprovalStanding(['APPROVED', 'DISMISSED'])).toBe(false)
  })

  test('thread replies after an approval leave it standing', () => {
    expect(isApprovalStanding(['APPROVED', 'COMMENTED', 'COMMENTED'])).toBe(true)
  })

  test('a block, or no verdict yet, is not an approval', () => {
    expect(isApprovalStanding(['APPROVED', 'CHANGES_REQUESTED'])).toBe(false)
    expect(isApprovalStanding([])).toBe(false)
  })
})
