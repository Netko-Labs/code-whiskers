import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { FixTarget } from '../fix'
import { type PrRef, postPrComment, replyToReviewComment } from '../review'
import { postToStudio } from '../review/studio-client'
import { REMEMBER_USAGE } from './constants'
import { parseRemember } from './utils'

const KIND_LABEL = {
  rule: 'a rule',
  preference: 'a preference',
  dont_flag: 'something not to flag',
  context: 'context',
  lesson: 'a lesson',
} as const

/**
 * `@code-whiskers remember …` from a repo insider: a note on this repository that the next review
 * reads. On an inline thread it applies to that file only. Studio keeps it, editable and undoable.
 */
export async function rememberNote(ref: PrRef, target: FixTarget, text: string) {
  const reply = (body: string) =>
    target.commentId !== null && target.path
      ? replyToReviewComment(ref, target.commentId, body)
      : postPrComment(ref, body)
  const request = parseRemember(text)
  if (!request) {
    await reply(REMEMBER_USAGE)
    return
  }
  const repo = `${ref.owner}/${ref.repo}`
  const paths = target.path ? [target.path] : []
  const isSaved = await postToStudio('memory', {
    repo,
    kind: request.kind,
    body: request.body,
    paths,
    source: 'review',
    sourceUrl: `https://github.com/${repo}/pull/${ref.prNumber}`,
    actor: target.author,
  })
  const where = paths.length > 0 ? `\`${paths[0]}\` in \`${repo}\`` : `\`${repo}\``
  const console = new URL('/console/memory', whiskersEnvConfig.app.webBaseUrl).toString()
  await reply(
    isSaved
      ? `Remembered as ${KIND_LABEL[request.kind]} for ${where}. Every review from now on reads it; edit or undo it in [Memory](${console}).`
      : 'Could not save that — the console is unreachable. Try again in a minute.',
  )
}
