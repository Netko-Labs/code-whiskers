import { z } from 'zod'

export const IdParamSchema = z.object({ id: z.string().uuid() })
export const RepoQuerySchema = z.object({ repo: z.string().min(3) })

export const RepositoryIdParamSchema = z.object({ id: z.coerce.number().int().positive() })
export const RepositoryWatchSchema = z.object({ isWatched: z.boolean() })
