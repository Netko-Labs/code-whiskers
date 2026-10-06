import { z } from 'zod'

const count = z.number().int().nonnegative()

/** Never uid 0: a jail that stayed root would keep raw sockets and its capabilities. */
export const JailPolicySchema = z.object({
  uid: z.number().int().positive(),
  gid: count,
  cwd: z.string().startsWith('/'),
  grants: z.array(
    z.object({
      path: z.string().startsWith('/'),
      access: z.enum(['read', 'exec', 'write', 'device']),
    }),
  ),
  connectPorts: z.array(z.number().int().min(1).max(65_535)),
  limits: z.object({
    cpuSeconds: count,
    memoryMb: count,
    processes: count,
    fileSizeMb: count,
    openFiles: count,
  }),
  hasSeccomp: z.boolean(),
})

export const JailProbeSchema = z.object({
  isUsable: z.boolean(),
  landlockAbi: z.number().int().nullable(),
  canDropUid: z.boolean(),
  hasSeccomp: z.boolean(),
  reason: z.string().nullable(),
})
