import { z } from 'zod'

const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const
const CATEGORIES = ['bug', 'security', 'performance', 'style', 'maintainability'] as const
const VERDICTS = ['approve', 'request_changes', 'comment'] as const

/**
 * Severity drives the blocking verdict, so an unrecognized label must never
 * silently soften one — models reach for these synonyms constantly.
 */
const SEVERITY_ALIASES: Record<string, (typeof SEVERITIES)[number]> = {
  blocker: 'critical',
  fatal: 'critical',
  severe: 'high',
  major: 'high',
  important: 'high',
  moderate: 'medium',
  warning: 'medium',
  normal: 'medium',
  minor: 'low',
  nit: 'low',
  nitpick: 'low',
  trivial: 'low',
  info: 'low',
  informational: 'low',
  suggestion: 'low',
}

function normalize(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value
}

/**
 * Models vary on casing (`"Security"`, `"HIGH"`), so normalize before the enum —
 * otherwise the fallback would reclassify a correctly-labelled finding.
 */
function looseEnum<const T extends readonly [string, ...string[]]>(values: T, fallback: T[number]) {
  return z.preprocess(normalize, z.enum(values).catch(fallback))
}

const SeveritySchema = z.preprocess((value) => {
  const normalized = normalize(value)
  return typeof normalized === 'string' ? (SEVERITY_ALIASES[normalized] ?? normalized) : normalized
}, z.enum(SEVERITIES).catch('medium'))

/**
 * The contract `generateObject` holds the model to. `file` and `title` are the
 * only hard requirements — cheap models routinely drop the rest, and a dropped
 * body or summary shouldn't cost a whole review.
 */
export const LlmFindingSchema = z.object({
  file: z.string(),
  line: z.number().int().positive().nullable().default(null),
  severity: SeveritySchema,
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
