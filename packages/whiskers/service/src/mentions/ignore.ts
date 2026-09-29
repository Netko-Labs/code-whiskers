import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { type FixTarget, isBotLogin } from '../fix'
import { type PrRef, postPrComment, replyToReviewComment, resolveThreadForComment } from '../review'
import { postToStudio } from '../review/studio-client'
import { IGNORE_OUTSIDE_THREAD } from './constants'
import { fetchThreadRoot } from './thread'
import { findingTitleOf } from './utils'

const MAX_NOTE_CHARS = 500

/**
 * `@code-whiskers ignore` on one of the reviewer's own threads: studio records the dismissal (so
 * no PR on this repo raises it again), the thread is resolved, and the reply says so.
 */
export async function ignoreFinding(ref: PrRef, target: FixTarget, reason: string, marker = '') {
  if (target.commentId === null || !target.path) {
    await postPrComment(ref, IGNORE_OUTSIDE_THREAD)
    return
  }
  const root = await fetchThreadRoot(ref, target.commentId)
  const isOwnThread = isBotLogin(root.author, whiskersEnvConfig.github.botHandle)
  const title = isOwnThread ? findingTitleOf(root.body) : null
  if (!title) {
    await replyToReviewComment(ref, root.id, IGNORE_OUTSIDE_THREAD)
    return
  }

  const repo = `${ref.owner}/${ref.repo}`
  const note = `ignored on GitHub by @${target.author}${reason ? `: ${reason}` : ''}`
  const isRecorded = await postToStudio('findings/dismiss', {
    repo,
    file: root.path,
    title,
    note: note.slice(0, MAX_NOTE_CHARS),
  })
  await resolveThreadForComment(ref, root.id).catch(() => undefined)
  await replyToReviewComment(
    ref,
    root.id,
    `${
      isRecorded
        ? `Dismissed — not raised again on \`${repo}\`.`
        : 'Resolved on this PR. The console could not record the dismissal, so other PRs may still raise it.'
    }${marker}`,
  )
}
