import { commentableLines } from '../chunk'
import { BLOCKING_SEVERITIES } from '../render'
import { isSameFinding } from '../settle'
import type { PriorThread } from '../types'
import { threadClaim } from './fingerprint'
import type { FixedInput } from './types'

function isOpenBlocker(thread: PriorThread): boolean {
  return (
    thread.severity !== null &&
    BLOCKING_SEVERITIES.has(thread.severity) &&
    !thread.isResolved &&
    !thread.isDownvoted &&
    !thread.isFixed &&
    thread.replies.length === 0
  )
}

/**
 * Blockers this push fixed, judged conservatively: a complete delta review touched the file,
 * GitHub marks the thread outdated (its lines changed), and nothing raised this round matches it.
 * The delta prompt asks only for new problems, so "not raised again" alone proves nothing.
 */
export function fixedThreads({ threads, raised, delta, isComplete }: FixedInput): PriorThread[] {
  if (!delta || !isComplete) return []
  const touched = new Set(commentableLines(delta).keys())
  return threads.filter(
    (thread) =>
      isOpenBlocker(thread) &&
      thread.isOutdated &&
      touched.has(thread.path) &&
      !raised.some((finding) => isSameFinding(finding, threadClaim(thread))),
  )
}
