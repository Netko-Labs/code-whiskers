import { MAX_COMMIT_FILES } from './constants'
import type { FetchedCommit, RepoRef } from './types'
import { prNumberFromMessage } from './utils'

const isNotFound = (error: unknown): boolean =>
  (error as { status?: number } | null)?.status === 404 ||
  (error as { status?: number } | null)?.status === 422

/** Shas in `base...head`, oldest first; a sha GitHub does not know answers null. */
export async function compareShas(
  { octokit, owner, repo }: RepoRef,
  base: string,
  head: string,
): Promise<string[] | null> {
  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
      owner,
      repo,
      basehead: `${base}...${head}`,
      per_page: 250,
    })
    return data.commits.map((commit) => commit.sha)
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

async function pullRequestOf({ octokit, owner, repo }: RepoRef, sha: string) {
  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls', {
      owner,
      repo,
      commit_sha: sha,
    })
    const merged = data.find((pull) => pull.merged_at) ?? data[0]
    return merged?.number ?? null
  } catch {
    return null
  }
}

/** One commit with its changed files and the pull request it came from; null when unknown. */
export async function fetchCommit(ref: RepoRef, sha: string): Promise<FetchedCommit | null> {
  try {
    const { data } = await ref.octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', {
      owner: ref.owner,
      repo: ref.repo,
      ref: sha,
    })
    const message = data.commit.message
    return {
      sha: data.sha,
      message,
      authorName: data.commit.author?.name ?? data.author?.login ?? 'unknown',
      authorLogin: data.author?.login ?? null,
      authorAvatar: data.author?.avatar_url ?? null,
      committedAt: new Date(data.commit.author?.date ?? data.commit.committer?.date ?? Date.now()),
      prNumber: prNumberFromMessage(message) ?? (await pullRequestOf(ref, data.sha)),
      files: (data.files ?? []).slice(0, MAX_COMMIT_FILES).map((file) => file.filename),
    }
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}
