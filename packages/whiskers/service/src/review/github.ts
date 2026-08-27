import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { LlmFinding, LlmReview } from '@code-whiskers/whiskers-domain'
import { App, Octokit } from 'octokit'

const { appId, appPrivateKey, token } = whiskersEnvConfig.github
const githubApp = appId && appPrivateKey ? new App({ appId, privateKey: appPrivateKey }) : null
const patOctokit = new Octokit({ auth: token })
const installationCache = new Map<string, Octokit>()

/**
 * App installation auth when GITHUB_APP_ID + key are configured (reviews post
 * as the app's bot identity); personal-token fallback otherwise (BYOK).
 */
async function octokitFor(owner: string, repo: string): Promise<Octokit> {
  if (!githubApp) return patOctokit
  const key = `${owner}/${repo}`
  const cached = installationCache.get(key)
  if (cached) return cached
  const { data } = await githubApp.octokit.request('GET /repos/{owner}/{repo}/installation', {
    owner,
    repo,
  })
  const installed = (await githubApp.getInstallationOctokit(data.id)) as unknown as Octokit
  installationCache.set(key, installed)
  return installed
}

export interface PrRef {
  owner: string
  repo: string
  prNumber: number
}

export interface PrHead {
  sha: string
  branch: string
  sameRepo: boolean
}

export async function fetchPrHead({ owner, repo, prNumber }: PrRef): Promise<PrHead> {
  const octokit = await octokitFor(owner, repo)
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner,
    repo,
    pull_number: prNumber,
  })
  return {
    sha: data.head.sha,
    branch: data.head.ref,
    sameRepo: data.head.repo?.full_name === data.base.repo.full_name,
  }
}

export async function fetchPrHeadSha(ref: PrRef): Promise<string> {
  return (await fetchPrHead(ref)).sha
}

/**
 * A token that can push to the repo: a short-lived installation token under
 * App auth, the configured PAT otherwise.
 */
export async function pushToken(owner: string, repo: string): Promise<string> {
  if (!githubApp) {
    if (!token) throw new Error('no GitHub credentials able to push')
    return token
  }
  const { data: installation } = await githubApp.octokit.request(
    'GET /repos/{owner}/{repo}/installation',
    { owner, repo },
  )
  const { data } = await githubApp.octokit.request(
    'POST /app/installations/{installation_id}/access_tokens',
    { installation_id: installation.id },
  )
  return data.token
}

export async function fetchPrDiff({ owner, repo, prNumber }: PrRef): Promise<string> {
  const octokit = await octokitFor(owner, repo)
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner,
    repo,
    pull_number: prNumber,
    mediaType: { format: 'diff' },
  })
  return data as unknown as string
}

export async function fetchFileAtRef(
  { owner, repo }: Omit<PrRef, 'prNumber'> & { prNumber?: number },
  path: string,
  gitRef: string,
): Promise<string> {
  const octokit = await octokitFor(owner, repo)
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner,
    repo,
    path,
    ref: gitRef,
  })
  const { content, encoding } = data as { content?: string; encoding?: string }
  if (!content || encoding !== 'base64') throw new Error(`unreadable file at ${path}@${gitRef}`)
  return Buffer.from(content, 'base64').toString('utf8')
}

export async function replyToReviewComment(
  { owner, repo, prNumber }: PrRef,
  commentId: number,
  body: string,
): Promise<void> {
  const octokit = await octokitFor(owner, repo)
  await octokit.request(
    'POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies',
    { owner, repo, pull_number: prNumber, comment_id: commentId, body },
  )
}

interface ReviewThreadsPage {
  repository: {
    pullRequest: {
      reviewThreads: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
        nodes: Array<{ id: string; comments: { nodes: Array<{ databaseId: number | null }> } }>
      }
    }
  }
}

/**
 * Mark the review thread containing `commentId` as resolved — REST has no
 * endpoint for this, so it's a GraphQL lookup + mutation. No-op when the
 * thread can't be found.
 */
export async function resolveThreadForComment(
  { owner, repo, prNumber }: PrRef,
  commentId: number,
): Promise<void> {
  const octokit = await octokitFor(owner, repo)
  let cursor: string | null = null
  do {
    const page: ReviewThreadsPage = await octokit.graphql(
      `query($owner: String!, $repo: String!, $pr: Int!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $pr) {
            reviewThreads(first: 100, after: $cursor) {
              pageInfo { hasNextPage endCursor }
              nodes { id comments(first: 50) { nodes { databaseId } } }
            }
          }
        }
      }`,
      { owner, repo, pr: prNumber, cursor },
    )
    const threads = page.repository.pullRequest.reviewThreads
    const match = threads.nodes.find((t) =>
      t.comments.nodes.some((c) => c.databaseId === commentId),
    )
    if (match) {
      await octokit.graphql(
        'mutation($id: ID!) { resolveReviewThread(input: { threadId: $id }) { thread { id } } }',
        { id: match.id },
      )
      return
    }
    cursor = threads.pageInfo.hasNextPage ? threads.pageInfo.endCursor : null
  } while (cursor)
}

export async function postPrComment({ owner, repo, prNumber }: PrRef, body: string): Promise<void> {
  const octokit = await octokitFor(owner, repo)
  await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
    owner,
    repo,
    issue_number: prNumber,
    body,
  })
}

const VERDICT_EVENT = {
  approve: 'APPROVE',
  request_changes: 'REQUEST_CHANGES',
  comment: 'COMMENT',
} as const

const CHECK_NAME = 'code-whiskers review'
const ANNOTATION_LEVEL = {
  low: 'notice',
  medium: 'warning',
  high: 'failure',
  critical: 'failure',
} as const
// The Checks API accepts at most 50 annotations per update.
const MAX_ANNOTATIONS = 50

export interface CheckOutput {
  title: string
  summary: string
  annotations: Array<{
    path: string
    start_line: number
    end_line: number
    annotation_level: 'notice' | 'warning' | 'failure'
    message: string
  }>
}

/** The check-run face of a review: verdict headline, summary, findings as annotations. */
export function buildCheckOutput(review: LlmReview): CheckOutput {
  const counts = review.findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.severity] = (acc[f.severity] ?? 0) + 1
    return acc
  }, {})
  const breakdown = ['critical', 'high', 'medium', 'low']
    .filter((s) => counts[s])
    .map((s) => `${counts[s]} ${s}`)
    .join(', ')
  const headline = review.verdict === 'approve' ? 'Approved' : 'Changes requested'
  return {
    title:
      review.findings.length === 0 ? `${headline} — no findings` : `${headline} — ${breakdown}`,
    summary: review.summary || 'No summary.',
    annotations: review.findings
      .filter((f) => f.line !== null)
      .slice(0, MAX_ANNOTATIONS)
      .map((f) => ({
        path: f.file,
        // SAFETY: filter above guarantees line is non-null
        start_line: f.line as number,
        end_line: f.line as number,
        annotation_level: ANNOTATION_LEVEL[f.severity],
        message: `[${f.severity}/${f.category}] ${f.title}\n\n${f.body}`,
      })),
  }
}

/** Checks are App-only — under PAT fallback this quietly reports nothing. */
export async function startCheckRun(ref: PrRef, headSha: string): Promise<number | null> {
  if (!githubApp) return null
  const octokit = await octokitFor(ref.owner, ref.repo)
  const { data } = await octokit.request('POST /repos/{owner}/{repo}/check-runs', {
    owner: ref.owner,
    repo: ref.repo,
    name: CHECK_NAME,
    head_sha: headSha,
    status: 'in_progress',
  })
  return Number(data.id)
}

/**
 * Approve -> green check, request_changes -> red check, pipeline error ->
 * neutral (an infra failure must not read as a code verdict).
 */
export async function completeCheckRun(
  ref: PrRef,
  checkRunId: number | null,
  result: { review: LlmReview } | { error: string },
): Promise<void> {
  if (checkRunId === null) return
  const octokit = await octokitFor(ref.owner, ref.repo)
  const done =
    'review' in result
      ? {
          conclusion:
            result.review.verdict === 'approve' ? ('success' as const) : ('failure' as const),
          output: buildCheckOutput(result.review),
        }
      : {
          conclusion: 'neutral' as const,
          output: { title: 'Review failed', summary: result.error.slice(0, 1000), annotations: [] },
        }
  await octokit.request('PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}', {
    owner: ref.owner,
    repo: ref.repo,
    check_run_id: checkRunId,
    status: 'completed',
    conclusion: done.conclusion,
    output: done.output,
  })
}

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
  const octokit = await octokitFor(ref.owner, ref.repo)
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
