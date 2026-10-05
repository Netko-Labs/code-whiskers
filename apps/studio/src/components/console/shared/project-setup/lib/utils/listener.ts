import { TEST_EVENT_TITLE } from '../constants'
import type { ListenerEvent, ListenerState, ReceivedIssue } from '../types'

export const LISTENING: ListenerState = { status: 'listening', hasFailed: false }

/** Waits until any issue exists for the project; once received it stays received. */
export function listenerReducer(state: ListenerState, event: ListenerEvent): ListenerState {
  if (state.status === 'received') return state
  if (event.type === 'failed') return state.hasFailed ? state : { ...state, hasFailed: true }
  if (event.type === 'test-sent') return { status: 'received', issue: event.issue }
  if (event.issue) return { status: 'received', issue: event.issue }
  return state.hasFailed ? LISTENING : state
}

export function testIssueOf(issueId: string): ReceivedIssue {
  return { id: issueId, title: TEST_EVENT_TITLE }
}
