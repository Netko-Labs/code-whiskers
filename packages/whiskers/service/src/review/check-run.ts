import type { ReviewContract } from '@code-whiskers/whiskers-domain'
import { type CheckOutput, octokitFor, type PrRef } from './github'
import {
  LOOP_HEADLINE,
  type ReviewReport,
  type ReviewTarget,
  renderAnnotation,
  renderContractText,
  renderLoopLine,
  renderReviewBody,
} from './render'
import type { CheckCompletion, CheckResult } from './types'

const ANNOTATION_LEVEL = {
  low: 'notice',
  medium: 'warning',
  high: 'failure',
  critical: 'failure',
} as const
// The Checks API accepts at most 50 annotations per update.
const MAX_ANNOTATIONS = 50

/**
 * The check-run face of a review: loop verdict headline, the review body, findings as annotations,
 * and the verdict contract as JSON in `text` for a coding agent.
 */
export function buildCheckOutput(
  report: ReviewReport,
  target: ReviewTarget,
  contract: ReviewContract,
): CheckOutput {
  const { review } = report
  const counts = review.findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.severity] = (acc[f.severity] ?? 0) + 1
    return acc
  }, {})
  const breakdown = ['critical', 'high', 'medium', 'low']
    .filter((s) => counts[s])
    .map((s) => `${counts[s]} ${s}`)
    .join(', ')
  const headline = `${LOOP_HEADLINE[contract.verdict]} — round ${contract.round}`
  return {
    title: `${headline} · ${breakdown || 'no findings'}`,
    summary: `${renderLoopLine(contract)}\n\n${renderReviewBody(report, target)}`,
    text: renderContractText(contract),
    annotations: review.findings
      .filter((f) => f.line !== null)
      .slice(0, MAX_ANNOTATIONS)
      .map((f) => ({
        path: f.file,
        // SAFETY: filter above guarantees line is non-null
        start_line: f.line as number,
        end_line: f.line as number,
        annotation_level: ANNOTATION_LEVEL[f.severity],
        message: renderAnnotation(f).slice(0, 4_000),
      })),
  }
}

/**
 * `mergeable` -> green check, `needs_changes` / `blocked` -> red check (as request_changes always
 * was), pipeline error -> neutral (an infra failure must not read as a code verdict).
 */
export async function completeCheckRun(
  ref: PrRef,
  headSha: string,
  checkRunId: number | null,
  result: CheckResult,
): Promise<void> {
  if (checkRunId === null) return
  const octokit = await octokitFor(ref.owner, ref.repo)
  const done: CheckCompletion =
    'report' in result
      ? {
          conclusion: result.contract.verdict === 'mergeable' ? 'success' : 'failure',
          output: buildCheckOutput(
            result.report,
            { owner: ref.owner, repo: ref.repo, headSha },
            result.contract,
          ),
        }
      : {
          conclusion: 'neutral',
          output: { title: 'Review failed', summary: result.error.slice(0, 1000), annotations: [] },
        }
  const base = {
    owner: ref.owner,
    repo: ref.repo,
    check_run_id: checkRunId,
    status: 'completed' as const,
    conclusion: done.conclusion,
  }
  try {
    await octokit.request('PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}', {
      ...base,
      output: done.output,
    })
  } catch {
    // A rejected annotation (hallucinated path, oversize) must not leave the
    // check hanging in_progress — retry without the annotations.
    const { title, summary, text } = done.output
    await octokit.request('PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}', {
      ...base,
      output: { title, summary, text },
    })
  }
}
