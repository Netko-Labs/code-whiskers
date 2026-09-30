import type { LlmFinding } from '@code-whiskers/whiskers-domain'
import parseDiff from 'parse-diff'
import type { GroundedFindings } from './types'

const MAX_MANIFEST_FILES = 150
// A quote may run past a shown line, but only a substantial one — `}` is inside everything.
const MIN_CONTAINED_CHARS = 12

function squash(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Every line the new side of each file shows in this slice of the diff, squashed. */
export function newSideLines(diff: string): Map<string, string[]> {
  const files = new Map<string, string[]>()
  for (const file of parseDiff(diff)) {
    if (!file.to || file.to === '/dev/null') continue
    const lines = file.chunks
      .flatMap((chunk) => chunk.changes)
      .filter((change) => change.type !== 'del')
      .map((change) => squash(change.content.slice(1)))
      .filter(Boolean)
    files.set(file.to, lines)
  }
  return files
}

function isQuoted(evidence: string, lines: string[]): boolean {
  const wanted = evidence
    .split('\n')
    .map(squash)
    .filter((line) => line.length > 2)
  if (wanted.length === 0) return false
  return wanted.every((line) =>
    lines.some(
      (shown) =>
        shown.includes(line) || (shown.length >= MIN_CONTAINED_CHARS && line.includes(shown)),
    ),
  )
}

/**
 * A finding stands on the lines it was shown: its file must be in this slice, and its evidence —
 * the line it quotes — must be there too. Everything else is speculation about unseen code.
 */
export function groundFindings(findings: LlmFinding[], diff: string): GroundedFindings {
  const shown = newSideLines(diff)
  const result: GroundedFindings = { kept: [], outsideSlice: 0, unquoted: 0 }
  for (const finding of findings) {
    const lines = shown.get(finding.file)
    if (!lines) result.outsideSlice += 1
    else if (!isQuoted(finding.evidence, lines)) result.unquoted += 1
    else result.kept.push(finding)
  }
  return result
}

/** The whole PR's file list, so a slice knows what exists beyond what it can see. */
export function buildFileManifest(diff: string): string {
  const files = parseDiff(diff)
    .map((file) => {
      const path = file.to && file.to !== '/dev/null' ? file.to : (file.from ?? '')
      const state = file.deleted
        ? 'deleted'
        : file.new
          ? 'added'
          : `+${file.additions} −${file.deletions}`
      return path ? `- ${path} (${state})` : ''
    })
    .filter(Boolean)
  if (files.length === 0) return ''
  const shown = files.slice(0, MAX_MANIFEST_FILES)
  const more = files.length - shown.length
  return `## Files changed in this PR (${files.length}) — you review one slice of it

${shown.join('\n')}${more > 0 ? `\n- …and ${more} more` : ''}

Every file listed exists at the head of this PR, whether or not your slice shows it.`
}
