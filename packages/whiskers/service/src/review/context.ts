import type { Finding } from '@code-whiskers/whiskers-domain'
import { isBotLogin } from '../fix/utils'
import type { PrConversation } from './github'
import type { Suppression } from './suppressions'
import type { PriorThread } from './types'

export interface PrContextInput {
  reviewCount: number
  previous?: { headSha: string; verdict: string | null; findings: Finding[] }
  conversation: PrConversation
  suppressions?: Suppression[]
  threads?: PriorThread[]
  botHandle: string
}

/**
 * The whole preamble rides in front of every chunk, so it is charged once per
 * chunk. Keep it short enough that it never competes with the diff for
 * attention or budget.
 */
const BUDGET_CHARS = 1_800
const MAX_FINDINGS = 6
const MAX_COMMENTS = 5
const MAX_BODY_CHARS = 160
const BLOCKING_STATES = new Set(['CHANGES_REQUESTED'])

/** Markdown, quotes and newlines carry no signal here — flatten and clip. */
function condense(body: string): string {
  const flat = body
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/^>.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
  return flat.length > MAX_BODY_CHARS ? `${flat.slice(0, MAX_BODY_CHARS - 1)}…` : flat
}

function findingLine(finding: Finding): string {
  const where = finding.line ? `${finding.file}:${finding.line}` : finding.file
  return `- ${where} [${finding.severity}] ${condense(finding.title)}`
}

function humanNotes(conversation: PrConversation, botHandle: string): string[] {
  const notes: string[] = []

  for (const verdict of conversation.verdicts) {
    if (isBotLogin(verdict.author, botHandle)) continue
    const body = condense(verdict.body)
    if (!body && !BLOCKING_STATES.has(verdict.state)) continue
    const label = BLOCKING_STATES.has(verdict.state) ? ' (requested changes)' : ''
    notes.push(`- ${verdict.author}${label}: ${body || 'no comment'}`)
  }

  for (const comment of conversation.inline) {
    if (comment.isReply || isBotLogin(comment.author, botHandle)) continue
    const body = condense(comment.body)
    if (!body) continue
    const where = comment.line ? `${comment.path}:${comment.line}` : comment.path
    notes.push(`- ${comment.author} on ${where}: ${body}`)
  }

  for (const comment of conversation.discussion) {
    if (isBotLogin(comment.author, botHandle)) continue
    const body = condense(comment.body)
    if (body) notes.push(`- ${comment.author}: ${body}`)
  }

  return notes
}

/** What became of each inline comment already posted: the answer is the part that matters. */
function ledgerLine(thread: PriorThread): string {
  const where = thread.line ? `${thread.path}:${thread.line}` : thread.path
  const reply = thread.replies[thread.replies.length - 1]
  const fate = thread.isResolved
    ? 'resolved'
    : reply
      ? `${reply.author} answered: ${condense(reply.body)}`
      : 'no answer yet'
  return `- ${where} ${condense(thread.title)} — ${fate}`
}

function section(title: string, lines: string[], limit: number): string {
  if (lines.length === 0) return ''
  const shown = lines.slice(0, limit)
  const rest = lines.length - shown.length
  const more = rest > 0 ? `\n- …and ${rest} more` : ''
  return `\n\n${title} (${lines.length}):\n${shown.join('\n')}${more}`
}

/**
 * A compact account of where this PR already stands, so a re-review can say
 * what changed instead of restating the whole file. Returns '' for a PR nobody
 * has touched — a first review should carry no preamble at all.
 */
export function buildPrContext(input: PrContextInput): string {
  const { reviewCount, previous, conversation, botHandle } = input
  const suppressions = input.suppressions ?? []
  const notes = humanNotes(conversation, botHandle)
  const threads = input.threads ?? []
  const earlier =
    threads.length > 0 ? threads.map(ledgerLine) : (previous?.findings ?? []).map(findingLine)
  const earlierTitle =
    threads.length > 0 ? 'What happened to my earlier comments' : 'Findings I raised last time'

  if (reviewCount === 0 && notes.length === 0 && suppressions.length === 0) return ''

  const times = reviewCount === 1 ? 'once' : `${reviewCount} times`
  const header =
    reviewCount > 0
      ? `Reviewed ${times} before. Last verdict: ${previous?.verdict ?? 'none'}` +
        (previous ? ` on ${previous.headSha.slice(0, 7)}.` : '.')
      : 'Not reviewed before.'

  const silenced = suppressions.map((s) =>
    s.note ? `- ${s.itemRef} — ${condense(s.note)}` : `- ${s.itemRef} (${s.status})`,
  )

  let body =
    section(earlierTitle, earlier, MAX_FINDINGS) +
    section('What humans have asked for', notes, MAX_COMMENTS) +
    section('Already settled — do not raise again', silenced, MAX_COMMENTS)

  // Trim the longest section first until the preamble fits its budget.
  let findingLimit = MAX_FINDINGS
  let commentLimit = MAX_COMMENTS
  while (header.length + body.length > BUDGET_CHARS && (findingLimit > 1 || commentLimit > 1)) {
    if (findingLimit >= commentLimit) findingLimit -= 1
    else commentLimit -= 1
    body =
      section(earlierTitle, earlier, findingLimit) +
      section('What humans have asked for', notes, commentLimit) +
      section('Already settled — do not raise again', silenced, commentLimit)
  }

  return `## Where this PR already stands — context, not part of the diff

${header}${body}

Act on it: do not re-raise a finding this diff fixes. A comment that was resolved or answered
is settled — do not raise it again in any wording; a human already decided. Raise only what is
new in this diff.`
}
