import { octokitForUser } from './client'

/** Reviews name their author by GitHub login; the session only knows the display name. */
export async function getGithubLogin(userId: string): Promise<{ login: string | null }> {
  const octokit = await octokitForUser(userId)
  if (!octokit) return { login: null }
  const { data } = await octokit.request('GET /user').catch(() => ({ data: null }))
  return { login: data?.login ?? null }
}
