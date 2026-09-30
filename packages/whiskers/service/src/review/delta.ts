import { octokitFor, type PrRef } from './github'

/**
 * What changed since the last reviewed commit — only when that commit is still an ancestor of
 * the head. A force-push or rebase rewrites history, and the whole PR is reviewed again.
 */
export async function fetchDeltaDiff(
  ref: PrRef,
  fromSha: string,
  toSha: string,
): Promise<string | null> {
  const octokit = await octokitFor(ref.owner, ref.repo)
  const basehead = `${fromSha}...${toSha}`
  const { data: comparison } = await octokit.request(
    'GET /repos/{owner}/{repo}/compare/{basehead}',
    {
      owner: ref.owner,
      repo: ref.repo,
      basehead,
    },
  )
  if (comparison.status !== 'ahead') return null
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
    owner: ref.owner,
    repo: ref.repo,
    basehead,
    mediaType: { format: 'diff' },
  })
  return data as unknown as string
}

const MAX_DESCRIPTION_CHARS = 2_000

/** The author's own account of the PR: design they state on purpose is not a bug to file. */
export function buildDescriptionContext(body: string): string {
  const text = body.replace(/<!--[\s\S]*?-->/g, '').trim()
  if (!text) return ''
  const clipped =
    text.length > MAX_DESCRIPTION_CHARS ? `${text.slice(0, MAX_DESCRIPTION_CHARS - 1)}…` : text
  return `## The author's description — decisions stated here are intentional

${clipped}`
}

export function buildDeltaNote(fromSha: string): string {
  return `## This push

You review only what changed since ${fromSha.slice(0, 7)}, the last reviewed commit. Earlier
code was reviewed already; report only problems these lines introduce.`
}
