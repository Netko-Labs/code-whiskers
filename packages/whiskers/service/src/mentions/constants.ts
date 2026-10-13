import type { MemoryKind, MentionCommand } from './types'

export const COMMAND_WORDS: Record<string, MentionCommand> = {
  fix: 'fix',
  review: 'review',
  rereview: 'review',
  're-review': 'review',
  ignore: 'ignore',
  dismiss: 'ignore',
  remember: 'remember',
  learn: 'remember',
}

/** The first word after `remember` picks the kind of note; without one it is context. */
export const MEMORY_KIND_WORDS: Record<string, MemoryKind> = {
  rule: 'rule',
  preference: 'preference',
  prefer: 'preference',
  "don't-flag": 'dont_flag',
  'dont-flag': 'dont_flag',
  ignore: 'dont_flag',
  context: 'context',
  lesson: 'lesson',
}

export const MEMORY_BODY_MAX = 600

export const REMEMBER_USAGE =
  'Say what to remember: `@code-whiskers remember rule: money is integer cents`. Kinds: rule, preference, dont-flag, context (the default), lesson.'

export const ANSWER_TIMEOUT_MS = 90_000
export const MAX_DIFF_CHARS = 24_000

export const ANSWER_SYSTEM = `You are CodeWhiskers, the reviewer on this pull request. A
maintainer mentioned you with a question. Answer it from the evidence given — the finding,
the file excerpt or the diff. Lead with the location or the fact, then the reasoning, in at
most 120 words of markdown. If the finding was wrong, say so plainly and add that replying
"@code-whiskers ignore" on the thread stops it being raised again. Say "will" when it will
and "may" when it may. No first person, no "I noticed", no emoji, no exclamation marks.`

export const IGNORE_OUTSIDE_THREAD =
  'Reply `ignore` on one of my review comments to dismiss that finding.'
