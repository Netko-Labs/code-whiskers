import { LlmReviewSchema } from '@code-whiskers/whiskers-domain'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY ?? '' })
const diff = await Bun.file('/tmp/pr9.diff').text()
const SYSTEM =
  'You are a senior code reviewer. Report only real, actionable findings. Respond with the JSON object only.'
for (const id of ['google/gemini-2.5-flash', 'openai/gpt-5-mini', 'z-ai/glm-5.3-flash']) {
  const t = Date.now()
  try {
    const { object } = await generateObject({
      model: openrouter(id), // no provider routing — matches prod today
      schema: LlmReviewSchema,
      system: SYSTEM,
      prompt: `Review this diff:\n\n${diff}`,
      abortSignal: AbortSignal.timeout(180_000),
    })
    console.log(`${id.padEnd(26)} OK   ${Date.now() - t}ms  findings=${object.findings.length}`)
  } catch (e) {
    console.log(`${id.padEnd(26)} FAIL ${Date.now() - t}ms  ${(e as Error).message.slice(0, 60)}`)
  }
}
