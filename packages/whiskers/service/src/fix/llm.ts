import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { type LlmFix, LlmFixSchema } from '@code-whiskers/whiskers-domain'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject, type LanguageModel } from 'ai'
import { openrouterModelSettings } from '../review/llm'
import { LLM_TIMEOUT_MS } from './constants'

const openrouter = createOpenRouter({ apiKey: whiskersEnvConfig.openrouter.apiKey })

export const fixModel = (): LanguageModel =>
  openrouter(whiskersEnvConfig.openrouter.model, openrouterModelSettings)

export const ANCHORED_SYSTEM = `You are the code-whiskers PR review agent. A user mentioned
you on a review comment and asked you to fix the issue discussed there. You get a
numbered excerpt of the file at the PR head and the commented line range. Return
"suggestion" as the exact replacement for that line range — complete lines with
correct indentation, no markdown fences, no line numbers. Keep the change minimal
and in scope. If no code change applies (a question, or the fix belongs elsewhere),
set suggestion to null and answer in "explanation". Keep the explanation to one or
two sentences.`

export const UNANCHORED_SYSTEM = `You are the code-whiskers PR review agent. A user
mentioned you on a pull request and asked you to fix something. You get the PR
diff. Set "suggestion" to null — there is no anchored line range — and answer in
"explanation" with short markdown: name the file paths and show the proposed
change in fenced code blocks. Stay minimal and in scope; if the request is not
actionable from the diff, say what is missing.`

export async function generateFix(system: string, prompt: string): Promise<LlmFix> {
  const { object } = await generateObject({
    model: fixModel(),
    schema: LlmFixSchema,
    system,
    prompt,
    abortSignal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  })
  return object
}
