import type { Finding, LoopVerdict } from '@code-whiskers/whiskers-domain'
import { MAX_ROUNDS } from '../loop/constants'
import { BLOCKING_SEVERITIES } from '../render'
import type { HumanReason } from '../types'
import {
  BRIEF_MARKER,
  HEADLINE,
  HOTSPOT_LIMIT,
  HUMAN_REASON,
  LIST_LIMIT,
  MEMORY_LIMIT,
} from './constants'
import type { BriefInput, BriefItem, BriefRound, MergeBrief } from './types'

const where = (item: Pick<BriefItem, 'file' | 'line'>) =>
  `\`${item.file}${item.line ? `:${item.line}` : ''}\``

function itemLine(item: BriefItem): string {
  const title = item.threadUrl ? `[${item.title}](${item.threadUrl})` : item.title
  const done = item.doneWhen ? ` — done when ${item.doneWhen}` : ''
  return `- **${item.severity}** ${title} ${where(item)}${done}`
}

function list(title: string, lines: string[]): string {
  if (lines.length === 0) return ''
  const shown = lines.slice(0, LIST_LIMIT)
  const more = lines.length > shown.length ? `\n- …and ${lines.length - shown.length} more` : ''
  return `\n\n### ${title}\n${shown.join('\n')}${more}`
}

/** Files the reviewer kept coming back to, counted once per finding id across every round. */
function hotspotsOf(findings: Finding[]) {
  const seen = new Map<string, Set<string>>()
  for (const finding of findings) {
    const ids = seen.get(finding.file) ?? new Set<string>()
    ids.add(finding.fingerprint ?? finding.title)
    seen.set(finding.file, ids)
  }
  return [...seen.entries()]
    .map(([file, ids]) => ({ file, findings: ids.size }))
    .filter((spot) => spot.findings > 1)
    .sort((a, b) => b.findings - a.findings)
    .slice(0, HOTSPOT_LIMIT)
}

/** Not stored: the round limit is the only other way the loop hands over. */
function humanReasonOf(verdict: LoopVerdict, round: number): HumanReason | null {
  if (verdict !== 'needs_human') return null
  return round >= MAX_ROUNDS ? 'round_limit' : 'stalled'
}

/**
 * The one card a human reads before merging: where the loop ended and why, what it fixed on the
 * way, what is still open, and which team notes shaped it. Built from stored rounds, no model.
 */
export function buildMergeBrief(input: BriefInput): MergeBrief | null {
  const latest = input.reviews.at(-1)
  if (!latest?.loopVerdict) return null
  const titleOf = new Map(
    input.findings.flatMap((f) => (f.fingerprint ? [[f.fingerprint, f.title] as const] : [])),
  )
  const rounds: BriefRound[] = input.reviews.map((review, index) => ({
    round: review.round ?? index + 1,
    head: review.headSha,
    verdict: review.loopVerdict,
    fixed: review.fixedSinceLastRound.map((id) => titleOf.get(id) ?? id),
  }))
  const current = input.findings.filter((f) => f.reviewId === latest.id)
  const open = current.filter((f) => BLOCKING_SEVERITIES.has(f.severity))
  const suggestions = current.filter((f) => !BLOCKING_SEVERITIES.has(f.severity))
  const hotspots = hotspotsOf(input.findings)
  const memory = (latest.memoryApplied ?? []).slice(0, MEMORY_LIMIT)
  const round = latest.round ?? rounds.length
  const fixedCount = rounds.reduce((total, r) => total + r.fixed.length, 0)

  const humanReason = humanReasonOf(latest.loopVerdict, round)
  const reason = humanReason ? `\n\nHanded over because ${HUMAN_REASON[humanReason]}.` : ''
  const markdown = [
    `## Merge brief — ${HEADLINE[latest.loopVerdict]}`,
    `\n\n\`${latest.headSha.slice(0, 7)}\` · round ${round} · ${fixedCount} fixed along the way · ${open.length} blocker${open.length === 1 ? '' : 's'} open${reason}`,
    list(
      'What the loop fixed',
      rounds.flatMap((r) => r.fixed.map((title) => `- round ${r.round}: ${title}`)),
    ),
    list('Still blocking', open.map(itemLine)),
    list('Suggestions left (non-blocking)', suggestions.map(itemLine)),
    list(
      'Where to look',
      hotspots.map((spot) => `- \`${spot.file}\` — ${spot.findings} findings across rounds`),
    ),
    list(
      'Team memory applied',
      memory.map((note) => `- (${note.kind}) ${note.body}`),
    ),
    `\n\n${BRIEF_MARKER}`,
  ].join('')

  return {
    pr: input.pr,
    head: latest.headSha,
    round,
    verdict: latest.loopVerdict,
    humanReason,
    rounds,
    open,
    suggestions,
    hotspots,
    memory,
    markdown,
  }
}
