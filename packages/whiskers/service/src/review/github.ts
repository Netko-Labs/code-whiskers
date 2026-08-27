import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { LlmFinding, LlmReview } from '@code-whiskers/whiskers-domain'
import { Octokit } from 'octokit'

const octokit = new Octokit({ auth: whiskersEnvConfig.github.token })

export interface PrRef {
  owner: string
  repo: string
  prNumber: number
}

export async function fetchPrHeadSha({ owner, repo, prNumber }: PrRef): Promise<string> {
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner,
    repo,
    pull_number: prNumber,
  })
  return data.head.sha
}

export async function fetchPrDiff({ owner, repo, prNumber }: PrRef): Promise<string> {
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner,
    repo,
    pull_number: prNumber,
    mediaType: { format: 'diff' },
  })
  return data as unknown as string
}

const VERDICT_EVENT = {
  approve: 'APPROVE',
  request_changes: 'REQUEST_CHANGES',
  comment: 'COMMENT',
} as const

function findingBody(finding: LlmFinding): string {
  const suggestion = finding.suggestion ? `\n\n**Suggestion:** ${finding.suggestion}` : ''
  return `**[${finding.severity}/${finding.category}] ${finding.title}**\n\n${finding.body}${suggestion}`
}

/**
 * One PR review: inline comments for findings with commentable lines, the rest
 * folded into the review body. Verdict maps straight onto GitHub's event.
 */
export async function postPrReview(
  ref: PrRef,
  headSha: string,
  review: LlmReview,
  commentable: Map<string, Set<number>>,
): Promise<void> {
  const inline = review.findings.filter(
    (f) => f.line !== null && commentable.get(f.file)?.has(f.line),
  )
  const orphaned = review.findings.filter((f) => !inline.includes(f))

  const orphanSection =
    orphaned.length > 0
      ? `\n\n---\n${orphaned.map((f) => `- ${f.file}${f.line ? `:${f.line}` : ''} — ${findingBody(f)}`).join('\n')}`
      : ''

  const payload = {
    owner: ref.owner,
    repo: ref.repo,
    pull_number: ref.prNumber,
    commit_id: headSha,
    body: `${review.summary}${orphanSection}`,
    comments: inline.map((f) => ({
      path: f.file,
      // SAFETY: filter above guarantees line is non-null for inline findings
      line: f.line as number,
      side: 'RIGHT' as const,
      body: findingBody(f),
    })),
  }
  try {
    await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
      ...payload,
      event: VERDICT_EVENT[review.verdict],
    })
  } catch (error) {
    // GitHub rejects APPROVE/REQUEST_CHANGES on your own PR (422). Personal-token
    // setups (dogfooding) demote to COMMENT so the findings still land.
    const { status, message } = error as { status?: number; message?: string }
    const ownPr = status === 422 && /your own pull request/i.test(message ?? '')
    if (!ownPr || review.verdict === 'comment') throw error
    await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
      ...payload,
      event: 'COMMENT',
    })
  }
}
