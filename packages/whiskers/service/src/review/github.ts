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

export async function fetchPrHeadSha({ owner, repo, prNumber }: PrRef): Promise<string> {
  const octokit = await octokitFor(owner, repo)
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner,
    repo,
    pull_number: prNumber,
  })
  return data.head.sha
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
