import { z } from 'zod'

/**
 * The contract `generateObject` holds the model to when a mention asks for a
 * fix. `suggestion` is the exact replacement for the commented line range —
 * null when no code change applies (a question, out-of-diff scope, …).
 */
export const LlmFixSchema = z.object({
  explanation: z.string(),
  suggestion: z.string().nullable(),
})
export type LlmFix = z.infer<typeof LlmFixSchema>
