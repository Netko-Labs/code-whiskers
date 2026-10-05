import { z } from 'zod'

/** One client key: the DSN's username. Any enabled key ingests; a disabled one is refused. */
export const whiskersProjectKeySchema = z.object({
  id: z.string(),
  publicKey: z.string(),
  label: z.string(),
  isEnabled: z.boolean(),
  createdAt: z.coerce.date(),
  lastUsedAt: z.coerce.date().nullable().default(null),
})

export const whiskersProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  repository: z.string().nullable().default(null),
  createdAt: z.coerce.date(),
  keys: z.array(whiskersProjectKeySchema).default([]),
  issues: z.number().default(0),
  lastEventAt: z.coerce.date().nullable().default(null),
})
export const whiskersProjectListSchema = z.array(whiskersProjectSchema)

export const whiskersTestEventSchema = z.object({ issueId: z.string(), eventId: z.string() })

export const whiskersDeletedSchema = z.object({ deleted: z.boolean() })

export const whiskersErrorBodySchema = z.object({ error: z.string() })
