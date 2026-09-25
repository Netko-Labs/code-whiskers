import type { LlmFinding } from '@code-whiskers/whiskers-domain'
import {
  BLOCKING_SEVERITIES,
  BOT_NAME,
  MAX_FAILURE_CHARS,
  MAX_HIGHLIGHTS,
  MAX_TABLE_ROWS,
  SEVERITY_LABEL,
  SEVERITY_ORDER,
} from './constants'
import type { ReviewCoverage, ReviewReport, ReviewTarget } from './types'

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

function bySeverity(a: LlmFinding, b: LlmFinding): number {
  return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
}

function quote(text: string): string {
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n')
}

// A pipe or newline inside a cell ends the table row.
function tableCell(text: string): string {
  return text
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\|/g, '\\|')
    .trim()
}

// Two segments keep `review/index.ts` apart from `render/index.ts` without a full-path column.
function shortPath(file: string): string {
  return file.split('/').slice(-2).join('/')
}

function locationLink(finding: LlmFinding, target: ReviewTarget): string {
  const anchor = finding.line === null ? '' : `#L${finding.line}`
  const label =
    finding.line === null ? shortPath(finding.file) : `${shortPath(finding.file)}:${finding.line}`
  const url = `https://github.com/${target.owner}/${target.repo}/blob/${target.headSha}/${encodeURI(finding.file)}${anchor}`
  return `[\`${label}\`](${url} "${finding.file}")`
}

function collapsed(summary: string, content: string): string {
  return `<details>\n<summary>${summary}</summary>\n\n${content}\n\n</details>`
}

/** One sentence per reviewed section; exact repeats collapse, list markers are ours to add. */
export function summaryLines(summary: string): string[] {
  const lines = summary
    .split('\n')
    .map((line) => line.replace(/^\s*[-*•]\s+/, '').trim())
    .filter(Boolean)
  return [...new Set(lines)]
}

function verdictLine({ review, carried }: ReviewReport): string {
  const headline = review.verdict === 'approve' ? 'Approved' : 'Changes requested'
  const { findings } = review
  if (findings.length === 0) {
    return `**${headline}** · ${carried?.open ? 'no new findings' : 'no findings'}`
  }

  const blocking = findings.filter((f) => BLOCKING_SEVERITIES.has(f.severity)).length
  const spread = `${plural(findings.length, 'finding')} across ${plural(new Set(findings.map((f) => f.file)).size, 'file')}`
  return blocking > 0
    ? `**${headline}** · ${blocking} blocking, ${spread}`
    : `**${headline}** · ${spread}, none blocking`
}

function coverageNote({ reviewed, total }: ReviewCoverage): string {
  const skipped = total - reviewed
  if (skipped <= 0) return ''
  return `_${skipped} of ${plural(total, 'section')} could not be reviewed (provider timed out). Everything here covers the rest._`
}

function findingsTable(findings: LlmFinding[], target: ReviewTarget): string {
  const shown = findings.slice(0, MAX_TABLE_ROWS)
  const rows = shown.map(
    (f) => `| ${SEVERITY_LABEL[f.severity]} | ${locationLink(f, target)} | ${tableCell(f.title)} |`,
  )
  const hidden = findings.length - shown.length
  const table = ['| Severity | Where | Finding |', '| --- | --- | --- |', ...rows].join('\n')
  return hidden > 0 ? `${table}\n\nPlus ${hidden} more, inline on the diff.` : table
}

function highlights(summary: string): string {
  const lines = summaryLines(summary)
  if (lines.length === 0) return ''
  const shown = lines.slice(0, MAX_HIGHLIGHTS).map((line) => `- ${line}`)
  const hidden = lines.length - shown.length
  if (hidden > 0) shown.push(`- Plus ${plural(hidden, 'more section')}.`)
  return `**What this changes**\n\n${shown.join('\n')}`
}

function fix(suggestion: string): string {
  const text = suggestion.trim()
  if (!text.includes('\n') || text.includes('```')) return `**Fix** — ${text}`
  return `**Fix**\n\n\`\`\`\n${text}\n\`\`\``
}

/** An inline review comment: the line it sits on already says where. */
export function renderFinding(finding: LlmFinding): string {
  const head = `**${SEVERITY_LABEL[finding.severity]} · ${finding.category}** — ${finding.title}`
  return [head, finding.body.trim(), finding.suggestion ? fix(finding.suggestion) : '']
    .filter(Boolean)
    .join('\n\n')
}

function outsideDiff(findings: LlmFinding[], target: ReviewTarget): string {
  const blocks = [...findings]
    .sort(bySeverity)
    .map((f) => `${locationLink(f, target)}\n\n${renderFinding(f)}`)
  return collapsed(
    `${plural(findings.length, 'finding')} not on a changed line`,
    blocks.join('\n\n---\n\n'),
  )
}

/** Earlier findings are not posted again; one line says they still count. */
function carriedNote(report: ReviewReport): string {
  const { open = 0, settled = 0 } = report.carried ?? {}
  const parts = [
    open > 0 ? `${plural(open, 'earlier finding')} still open on this PR` : '',
    settled > 0 ? `${settled} answered by you and not raised again` : '',
  ].filter(Boolean)
  return parts.length > 0 ? `<sub>${parts.join(' · ')}</sub>` : ''
}

/**
 * Verdict, then where the problems are, then what the PR does. Low-severity notes and findings
 * GitHub cannot anchor inline stay collapsed so the blocking rows are the first thing read.
 */
export function renderReviewBody(
  report: ReviewReport,
  target: ReviewTarget,
  unanchored: LlmFinding[] = [],
): string {
  const findings = [...report.review.findings].sort(bySeverity)
  const notable = findings.filter((f) => f.severity !== 'low')
  const notes = findings.filter((f) => f.severity === 'low')

  return [
    verdictLine(report),
    coverageNote(report.coverage),
    carriedNote(report),
    notable.length > 0 ? findingsTable(notable, target) : '',
    notes.length > 0
      ? collapsed(plural(notes.length, 'low-severity note'), findingsTable(notes, target))
      : '',
    highlights(report.review.summary),
    unanchored.length > 0 ? outsideDiff(unanchored, target) : '',
    `<sub>${BOT_NAME} · ${report.model}</sub>`,
  ]
    .filter(Boolean)
    .join('\n\n')
}

/** Check-run annotations are plain text. */
export function renderAnnotation(finding: LlmFinding): string {
  const head = `${SEVERITY_LABEL[finding.severity]} · ${finding.category} — ${finding.title}`
  return [head, finding.body.trim()].filter(Boolean).join('\n\n')
}

export function renderFailureComment(headSha: string, message: string): string {
  return [
    `**Review failed** on \`${headSha.slice(0, 7)}\``,
    quote(message.slice(0, MAX_FAILURE_CHARS)),
    'Usually a transient provider error. Push a commit to run the review again.',
  ].join('\n\n')
}
