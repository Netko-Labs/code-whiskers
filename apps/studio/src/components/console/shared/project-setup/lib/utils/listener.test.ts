import { describe, expect, test } from 'bun:test'
import { TEST_EVENT_TITLE } from '../constants'
import type { ListenerState } from '../types'
import { LISTENING, listenerReducer, testIssueOf } from './listener'

const ISSUE = { id: 'issue-1', title: 'TypeError: x is undefined' }
const RECEIVED: ListenerState = { status: 'received', issue: ISSUE }

describe('listenerReducer', () => {
  test('an empty poll keeps listening', () => {
    expect(listenerReducer(LISTENING, { type: 'polled', issue: null })).toBe(LISTENING)
  })

  test('the first issue flips it to received', () => {
    expect(listenerReducer(LISTENING, { type: 'polled', issue: ISSUE })).toEqual(RECEIVED)
  })

  test('a sent test event flips it without waiting for the poll', () => {
    expect(listenerReducer(LISTENING, { type: 'test-sent', issue: testIssueOf('t-1') })).toEqual({
      status: 'received',
      issue: { id: 't-1', title: TEST_EVENT_TITLE },
    })
  })

  test('received is final: later polls, failures and tests change nothing', () => {
    expect(listenerReducer(RECEIVED, { type: 'polled', issue: null })).toBe(RECEIVED)
    expect(listenerReducer(RECEIVED, { type: 'failed' })).toBe(RECEIVED)
    expect(listenerReducer(RECEIVED, { type: 'test-sent', issue: testIssueOf('t-2') })).toBe(
      RECEIVED,
    )
  })

  test('a failed read keeps listening and says so; the next good poll clears it', () => {
    const failed = listenerReducer(LISTENING, { type: 'failed' })
    expect(failed).toEqual({ status: 'listening', hasFailed: true })
    expect(listenerReducer(failed, { type: 'failed' })).toBe(failed)
    expect(listenerReducer(failed, { type: 'polled', issue: null })).toEqual(LISTENING)
  })
})
