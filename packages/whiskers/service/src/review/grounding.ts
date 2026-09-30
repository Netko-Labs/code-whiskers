import type { LlmFinding } from '@code-whiskers/whiskers-domain'
import parseDiff from 'parse-diff'
import type { GroundedFindings, ShownLine } from './types'

const MAX_MANIFEST_FILES = 150
// A quote may run past a shown line, but only a substantial one — `}` is inside everything.
const MIN_CONTAINED_CHARS = 12
const LINE_WINDOW = 6

function squash(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Every line the new side of each file shows in this slice, with its new-side number. */
export function newSideLines(diff: string): Map<string, ShownLine[]> {
  const files = new Map<string, ShownLine[]>()
  for (const file of parseDiff(diff)) {
    if (!file.to || file.to === '/dev/null') continue
    const lines: ShownLine[] = []
    for (const change of file.chunks.flatMap((chunk) => chunk.changes)) {
      if (change.type === 'del') continue
      const number = change.type === 'add' ? change.ln : change.ln2
      const text = squash(change.content.slice(1))
      if (text) lines.push({ number, text })
    }
    files.set(file.to, lines)
  }
  return files
}

function matches(shown: string, quoted: string): boolean {
  return shown.includes(quoted) || (shown.length >= MIN_CONTAINED_CHARS && quoted.includes(shown))
}

/**
 * Where the evidence's first line sits — near the reported line when there is one, since models
 * misnumber by a few lines but a quote from elsewhere in the file supports a different claim.
 */
function quotedAt(finding: LlmFinding, lines: ShownLine[]): number | null {
  const wanted = finding.evidence
    .split('\n')
    .map(squash)
    .filter((line) => line.length > 2)
  const [first, ...rest] = wanted
  if (!first) return null
  const candidates = lines.filter(
    (shown) =>
      matches(shown.text, first) &&
      (finding.line === null || Math.abs(shown.number - finding.line) <= LINE_WINDOW),
  )
  // The rest of a multi-line quote must follow the first line, not appear anywhere in the file.
  const hit = candidates.find((shown) =>
    rest.every((line) =>
      lines.some(
        (other) =>
          other.number > shown.number &&
          other.number <= shown.number + rest.length + 2 &&
          matches(other.text, line),
      ),
    ),
  )
  return hit ? hit.number : null
}

/**
 * A finding stands on the lines it was shown: its file must be in this slice, and its evidence —
 * the line it quotes — must be there, near the line it reports; the finding moves onto that line. Everything else is speculation about unseen code.
 */
export function groundFindings(findings: LlmFinding[], diff: string): GroundedFindings {
  const shown = newSideLines(diff)
  const result: GroundedFindings = { kept: [], outsideSlice: 0, unquoted: 0 }
  for (const finding of findings) {
    const lines = shown.get(finding.file)
    const at = lines ? quotedAt(finding, lines) : null
    if (!lines) result.outsideSlice += 1
    else if (at === null) result.unquoted += 1
    else result.kept.push({ ...finding, line: at })
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
