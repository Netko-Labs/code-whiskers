import { z } from 'zod'

const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const
const CATEGORIES = ['bug', 'security', 'performance', 'style', 'maintainability'] as const
const VERDICTS = ['approve', 'request_changes', 'comment'] as const

/**
 * Models vary on casing (`"Security"`, `"HIGH"`), so normalize before the enum —
 * otherwise the fallback would silently reclassify a correctly-labelled finding.
 */
function looseEnum<const T extends readonly [string, ...string[]]>(values: T, fallback: T[number]) {
  return z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.enum(values).catch(fallback),
  )
}

/**
 * The contract `generateObject` holds the model to. `file` and `title` are the
 * only hard requirements — cheap models routinely drop the rest, and a dropped
 * body or summary shouldn't cost a whole review.
 */
export const LlmFindingSchema = z.object({
  file: z.string(),
  line: z.number().int().positive().nullable().default(null),
  severity: looseEnum(SEVERITIES, 'medium'),
  category: looseEnum(CATEGORIES, 'bug'),
  title: z.string(),
  body: z.string().default(''),
  suggestion: z.string().nullable().default(null),
})
export type LlmFinding = z.infer<typeof LlmFindingSchema>

export const LlmReviewSchema = z.object({
  findings: z.array(LlmFindingSchema).default([]),
  summary: z.string().default(''),
  verdict: looseEnum(VERDICTS, 'comment'),
})
export type LlmReview = z.infer<typeof LlmReviewSchema>
