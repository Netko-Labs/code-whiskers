import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { type LlmFix, LlmFixSchema } from '@code-whiskers/whiskers-domain'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'
import {
  fetchFileAtRef,
  fetchPrDiff,
  fetchPrHeadSha,
  type PrRef,
  postPrComment,
  replyToReviewComment,
} from '../review/github'
import type { FixTarget } from './types'
import { buildFixReply, numberedExcerpt } from './utils'

export * from './types'
export * from './utils'

const openrouter = createOpenRouter({ apiKey: whiskersEnvConfig.openrouter.apiKey })

const MAX_DIFF_CHARS = 60_000

const ANCHORED_SYSTEM = `You are the code-whiskers PR review agent. A user mentioned
you on a review comment and asked you to fix the issue discussed there. You get a
numbered excerpt of the file at the PR head and the commented line range. Return
"suggestion" as the exact replacement for that line range — complete lines with
correct indentation, no markdown fences, no line numbers. Keep the change minimal
and in scope. If no code change applies (a question, or the fix belongs elsewhere),
set suggestion to null and answer in "explanation". Keep the explanation to one or
two sentences.`

const UNANCHORED_SYSTEM = `You are the code-whiskers PR review agent. A user
mentioned you on a pull request and asked you to fix something. You get the PR
diff. Set "suggestion" to null — there is no anchored line range — and answer in
"explanation" with short markdown: name the file paths and show the proposed
change in fenced code blocks. Stay minimal and in scope; if the request is not
actionable from the diff, say what is missing.`

async function generateFix(system: string, prompt: string): Promise<LlmFix> {
  const { object } = await generateObject({
    model: openrouter(whiskersEnvConfig.openrouter.model),
    schema: LlmFixSchema,
    system,
    prompt,
  })
  return object
}

/** Mention-to-fix pipeline: gather context -> LLM -> reply where the ask happened. */
export async function runFix(ref: PrRef, target: FixTarget): Promise<void> {
  const anchored = target.commentId !== null && target.path !== null && target.line !== null

  if (anchored) {
    // SAFETY: `anchored` guarantees path/line/commentId are non-null
    const path = target.path as string
    const line = target.line as number
    const start = target.startLine ?? line
    const headSha = await fetchPrHeadSha(ref)
    const excerpt = numberedExcerpt(await fetchFileAtRef(ref, path, headSha), start, line)
    const fix = await generateFix(
      ANCHORED_SYSTEM,
      `File: ${path}\nCommented lines: ${start}-${line}\n\nExcerpt:\n${excerpt}\n\nRequest from @${target.author}:\n${target.body}`,
    )
    await replyToReviewComment(ref, target.commentId as number, buildFixReply(fix))
    return
  }

  const diff = (await fetchPrDiff(ref)).slice(0, MAX_DIFF_CHARS)
  const fix = await generateFix(
    UNANCHORED_SYSTEM,
    `PR diff:\n${diff}\n\nRequest from @${target.author}:\n${target.body}`,
  )
  const reply = buildFixReply(fix)
  if (target.commentId !== null) {
    await replyToReviewComment(ref, target.commentId, reply)
  } else {
    await postPrComment(ref, `@${target.author} ${reply}`)
  }
}
