import { z } from 'zod'

export const ProjectCreateSchema = z.object({ name: z.string().trim().min(1).max(80) })

export const LogQuerySchema = z.object({
  service: z.string().max(200).optional(),
  level: z.enum(['error', 'warn']).optional(),
  q: z.string().max(200).optional(),
  before: z.coerce.number().int().positive().optional(),
})

export const TraceQuerySchema = z.object({ service: z.string().max(200).optional() })

export const ReviewRerunSchema = z.object({
  owner: z.string().min(1).max(100),
  repo: z.string().min(1).max(100),
  prNumber: z.coerce.number().int().positive(),
})
