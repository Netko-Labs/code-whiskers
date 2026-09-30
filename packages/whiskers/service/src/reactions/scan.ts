import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { type FixTarget, isBotLogin, runFix } from '../fix'
import { answerQuestion, ignoreFinding } from '../mentions'
import {
  octokitFor,
  type PrRef,
  replyToReviewComment,
  type Suppression,
  suppressedFindings,
} from '../review'
import { readFromStudio } from '../review/studio-client'
import {
  EXPLAIN_PROMPT,
  MAX_ATTEMPTS,
  PERMISSION_TTL_MS,
  REACTION_EMOJI,
  TRUSTED_PERMISSIONS,
} from './constants'
import type { CachedPermission, PendingReaction, ScannedComment } from './types'
import { dismissalKey, pendingReactions, reactionMarker } from './utils'

const logger = createLogger('whiskers-reactions')
const MAX_COMMENT_PAGES = 3
const permissions = new Map<string, CachedPermission>()
// A handler that keeps failing leaves no marker; stop retrying it every minute.
const attempts = new Map<string, number>()

async function listReviewComments(ref: PrRef): Promise<ScannedComment[]> {
  const octokit = await octokitFor(ref.owner, ref.repo)
  const comments: ScannedComment[] = []
  for (let page = 1; page <= MAX_COMMENT_PAGES; page += 1) {
    const { data } = await octokit.request(
      'GET /repos/{owner}/{repo}/pulls/{pull_number}/comments',
      {
        owner: ref.owner,
        repo: ref.repo,
        pull_number: ref.prNumber,
        per_page: 100,
        page,
      },
    )
    for (const c of data) {
      comments.push({
        id: Number(c.id),
        inReplyToId: c.in_reply_to_id ? Number(c.in_reply_to_id) : null,
        author: c.user?.login ?? '',
        path: c.path,
        line: c.line ?? c.original_line ?? null,
        body: c.body,
        reactions: {
          '-1': c.reactions?.['-1'] ?? 0,
          rocket: c.reactions?.rocket ?? 0,
          confused: c.reactions?.confused ?? 0,
        },
      })
    }
    if (data.length < 100) break
  }
  return comments
}

/** A reaction is a command only from someone who could push to the repository. */
async function isTrusted(ref: PrRef, login: string): Promise<boolean> {
  const key = `${ref.owner}/${ref.repo}:${login}`.toLowerCase()
  const cached = permissions.get(key)
  if (cached && Date.now() - cached.at < PERMISSION_TTL_MS) return cached.isTrusted
  const octokit = await octokitFor(ref.owner, ref.repo)
  const permission = await octokit
    .request('GET /repos/{owner}/{repo}/collaborators/{username}/permission', {
      owner: ref.owner,
      repo: ref.repo,
      username: login,
    })
    .then(({ data }) => data.permission)
    .catch(() => 'none')
  const trusted = TRUSTED_PERMISSIONS.has(permission)
  permissions.set(key, { isTrusted: trusted, at: Date.now() })
  return trusted
}

async function reactorOf(ref: PrRef, pending: PendingReaction): Promise<string | null> {
  const octokit = await octokitFor(ref.owner, ref.repo)
  const { data } = await octokit.request(
    'GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions',
    { owner: ref.owner, repo: ref.repo, comment_id: pending.rootId, content: pending.content },
  )
  const botHandle = whiskersEnvConfig.github.botHandle
  // The `content` filter is GitHub's; the check is ours — another emoji must never authorize this one.
  for (const reaction of data) {
    const login = reaction.user?.login
    if (reaction.content !== pending.content || !login || isBotLogin(login, botHandle)) continue
    if (await isTrusted(ref, login)) return login
  }
  return null
}

function targetFor(pending: PendingReaction, author: string, body: string): FixTarget {
  return {
    commentId: pending.rootId,
    path: pending.path,
    startLine: null,
    line: pending.line,
    body,
    author,
  }
}

async function act(ref: PrRef, pending: PendingReaction, login: string) {
  const marker = reactionMarker(pending.content)
  const reason = `reacted ${REACTION_EMOJI[pending.content]}`
  if (pending.command === 'ignore') {
    await ignoreFinding(ref, targetFor(pending, login, ''), reason, marker, true)
  } else if (pending.command === 'explain') {
    await answerQuestion(ref, targetFor(pending, login, ''), EXPLAIN_PROMPT, marker)
  } else {
    // The marker goes first: a fix can take minutes, and the next scan must not start another.
    await replyToReviewComment(
      ref,
      pending.rootId,
      `Fixing — requested by @${login} with 🚀.${marker}`,
    )
    await runFix(ref, targetFor(pending, login, '@code-whiskers fix'))
  }
}

/** Acts on every unhandled command reaction on one pull request. */
export async function scanPullRequest(ref: PrRef): Promise<number> {
  const [comments, suppressions] = await Promise.all([
    listReviewComments(ref),
    readFromStudio<Suppression[] | null>(
      'suppressions',
      { scope: `${ref.owner}/${ref.repo}` },
      null,
    ),
  ])
  // Without studio there is no telling a handled 👎 from a new one; fix and explain still run.
  const dismissed = new Set(suppressedFindings(suppressions.value ?? []).map(dismissalKey))
  const pending = pendingReactions(comments, whiskersEnvConfig.github.botHandle, dismissed).filter(
    (reaction) => suppressions.value !== null || reaction.command !== 'ignore',
  )
  let handled = 0
  for (const reaction of pending) {
    const key = `${reaction.rootId}:${reaction.content}`
    const tried = attempts.get(key) ?? 0
    if (tried >= MAX_ATTEMPTS) continue
    const login = await reactorOf(ref, reaction)
    if (!login) continue
    logger.info({ ...ref, command: reaction.command, login }, 'reaction command')
    attempts.set(key, tried + 1)
    await act(ref, reaction, login).catch((error) =>
      logger.warn(
        { ...ref, err: error instanceof Error ? error.message : String(error) },
        'reaction command failed',
      ),
    )
    handled += 1
  }
  return handled
}
