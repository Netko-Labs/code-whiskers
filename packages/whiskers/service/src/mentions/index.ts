import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { type FixTarget, runFix } from '../fix'
import { type PrRef, runReview } from '../review'
import { answerQuestion } from './answer'
import { ignoreFinding } from './ignore'
import { acknowledge } from './thread'
import type { MentionSource } from './types'
import { parseMention } from './utils'

export { answerQuestion } from './answer'
export { ignoreFinding } from './ignore'
export * from './types'
export * from './utils'

const logger = createLogger('whiskers-mentions')

/** Routes one `@code-whiskers …` from a repo insider to the command it names. */
export async function runMention(ref: PrRef, target: FixTarget, source: MentionSource) {
  const { command, text } = parseMention(target.body, whiskersEnvConfig.github.botHandle)
  logger.info({ ...ref, command, author: target.author }, 'mention received')

  if (command === 'fix') return runFix(ref, target)
  if (command === 'ignore') return ignoreFinding(ref, target, text)

  // Reviews and answers take a while; the reaction says the mention was heard.
  if (source.commentId !== null) {
    await acknowledge(ref, source.commentId, source.isReviewComment).catch(() => undefined)
  }
  if (command === 'review') {
    await runReview(ref, { force: true })
    return
  }
  return answerQuestion(ref, target, text)
}
