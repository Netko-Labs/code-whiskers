import { z } from 'zod'

export const REVIEW_RULE_EFFECTS = ['blocker', 'suggestion', 'filter', 'tone'] as const

export const ReviewRuleCreateSchema = z.object({
  installationId: z.coerce.number().int().positive(),
  body: z.string().trim().min(3).max(1_000),
  scope: z.string().trim().min(1).max(200).default('**'),
  effect: z.enum(REVIEW_RULE_EFFECTS),
})
export type ReviewRuleCreate = z.infer<typeof ReviewRuleCreateSchema>

export const ReviewRuleUpdateSchema = z.object({
  body: z.string().trim().min(3).max(1_000).optional(),
  scope: z.string().trim().min(1).max(200).optional(),
  effect: z.enum(REVIEW_RULE_EFFECTS).optional(),
  isMuted: z.boolean().optional(),
})
export type ReviewRuleUpdate = z.infer<typeof ReviewRuleUpdateSchema>

export const IdParamSchema = z.object({ id: z.string().uuid() })
export const RepoQuerySchema = z.object({ repo: z.string().min(3) })
