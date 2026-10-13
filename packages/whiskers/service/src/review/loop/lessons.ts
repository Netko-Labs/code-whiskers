import type { PrRef } from '../github'
import { postToStudio } from '../studio-client'
import type { PriorThread } from '../types'

const LESSON_SEVERITIES = new Set(['high', 'critical'])

/**
 * A blocker a push actually fixed was a real bug in that file: memory keeps it as a lesson so
 * later reviews look harder there. Lower severities are not worth a note.
 */
export function learnFromFixed(ref: PrRef, headSha: string, fixed: PriorThread[]): void {
  const repo = `${ref.owner}/${ref.repo}`
  for (const thread of fixed) {
    if (!thread.severity || !LESSON_SEVERITIES.has(thread.severity)) continue
    void postToStudio('memory', {
      repo,
      kind: 'lesson',
      body: `${thread.title} (a real ${thread.severity} bug here, fixed in ${headSha.slice(0, 7)})`.slice(
        0,
        600,
      ),
      paths: [thread.path],
      source: 'fix',
      sourceUrl: `https://github.com/${repo}/pull/${ref.prNumber}`,
      actor: 'whiskers',
    })
  }
}
