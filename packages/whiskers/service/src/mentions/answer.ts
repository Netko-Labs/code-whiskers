import { generateText } from 'ai'
import { clampBody, type FixTarget, numberedExcerpt } from '../fix'
import {
  fetchFileAtRef,
  fetchPrDiff,
  fetchPrHeadSha,
  type PrRef,
  postPrComment,
  replyToReviewComment,
} from '../review'
import { openrouterModel } from '../shared/llm'
import { ANSWER_SYSTEM, ANSWER_TIMEOUT_MS, MAX_DIFF_CHARS } from './constants'
import { fetchThreadRoot } from './thread'

const EXCERPT_CONTEXT_LINES = 20

async function generateAnswer(prompt: string): Promise<string> {
  const { text } = await generateText({
    model: openrouterModel(),
    system: ANSWER_SYSTEM,
    prompt,
    abortSignal: AbortSignal.timeout(ANSWER_TIMEOUT_MS),
  })
  return text.trim()
}

function quoted(text: string): string {
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n')
}

/**
 * On a review thread the answer is grounded in the finding and the file at head; anywhere else in
 * the PR diff. It replies where it was asked.
 */
export async function answerQuestion(ref: PrRef, target: FixTarget, question: string) {
  const asked = `Question from ${target.author}:\n${clampBody(question)}`

  if (target.commentId !== null && target.path) {
    const root = await fetchThreadRoot(ref, target.commentId)
    const line = root.line ?? target.line
    const headSha = await fetchPrHeadSha(ref)
    const source = await fetchFileAtRef(ref, root.path, headSha).catch(() => '')
    const excerpt = source && line ? numberedExcerpt(source, line, line, EXCERPT_CONTEXT_LINES) : ''
    const where = line ? `${root.path}:${line}` : root.path
    const answer = await generateAnswer(
      [
        `Thread on ${where}, opened by ${root.author}:\n${clampBody(root.body)}`,
        excerpt && `File at the PR head:\n${excerpt}`,
        asked,
      ]
        .filter(Boolean)
        .join('\n\n'),
    )
    await replyToReviewComment(ref, root.id, answer)
    return
  }

  const diff = (await fetchPrDiff(ref)).slice(0, MAX_DIFF_CHARS)
  const answer = await generateAnswer(`Pull request diff:\n${diff}\n\n${asked}`)
  await postPrComment(ref, `${quoted(clampBody(question))}\n\n${answer}`)
}
