import { z } from 'zod'

/**
 * The contract `generateObject` holds the model to — a finding that fails this
 * schema is rejected and retried by the AI SDK, never stored.
 */
export const LlmFindingSchema = z.object({
  file: z.string(),
  line: z.number().int().positive().nullable(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['bug', 'security', 'performance', 'style', 'maintainability']),
  title: z.string(),
  body: z.string(),
  suggestion: z.string().nullable(),
})
export type LlmFinding = z.infer<typeof LlmFindingSchema>

export const LlmReviewSchema = z.object({
  findings: z.array(LlmFindingSchema),
  summary: z.string(),
  verdict: z.enum(['approve', 'request_changes', 'comment']),
})
export type LlmReview = z.infer<typeof LlmReviewSchema>
