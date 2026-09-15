import { z } from 'zod'

/**
 * The contract `generateObject` holds the model to. `file` and `title` are the
 * only hard requirements — cheap models routinely drop the rest, and a dropped
 * body or summary shouldn't cost a whole review. Bad enums fall back instead
 * of failing.
 */
export const LlmFindingSchema = z.object({
  file: z.string(),
  line: z.number().int().positive().nullable().default(null),
  severity: z.enum(['low', 'medium', 'high', 'critical']).catch('medium'),
  category: z.enum(['bug', 'security', 'performance', 'style', 'maintainability']).catch('bug'),
  title: z.string(),
  body: z.string().default(''),
  suggestion: z.string().nullable().default(null),
})
export type LlmFinding = z.infer<typeof LlmFindingSchema>

export const LlmReviewSchema = z.object({
  findings: z.array(LlmFindingSchema).default([]),
  summary: z.string().default(''),
  verdict: z.enum(['approve', 'request_changes', 'comment']).catch('comment'),
})
export type LlmReview = z.infer<typeof LlmReviewSchema>
