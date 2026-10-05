import type { LogFilterParams, WindowSpec } from './telemetry-types'
import type { ProjectScope } from './types'

/** Epoch-millisecond bounds for a request made at `now`; a relative window has no upper bound. */
export function windowParams(spec: WindowSpec, now = Date.now()): Record<string, string> {
  if ('sinceMs' in spec) return { from: String(now - spec.sinceMs) }
  return { from: String(spec.from), to: String(spec.to) }
}

export function logFilterParams(filter: LogFilterParams): Record<string, string | undefined> {
  const attrs = filter.attrs && Object.keys(filter.attrs).length ? filter.attrs : undefined
  return {
    service: filter.service,
    levels: filter.levels?.length ? filter.levels.join(',') : undefined,
    q: filter.q,
    traceId: filter.traceId,
    attrs: attrs ? JSON.stringify(attrs) : undefined,
  }
}

export function params(values: Record<string, string | undefined>): string {
  const defined = Object.entries(values).filter((entry): entry is [string, string] => !!entry[1])
  return defined.length ? `?${new URLSearchParams(defined)}` : ''
}

/** A scope with no projects has nothing to read; answer empty instead of asking for everything. */
export function scoped<T>(projectIds: ProjectScope, read: (projectId?: string) => Promise<T[]>) {
  return scopedOr(projectIds, [] as T[], read)
}

export function scopedOr<T>(
  projectIds: ProjectScope,
  empty: T,
  read: (projectId?: string) => Promise<T>,
): Promise<T> {
  if (projectIds?.length === 0) return Promise.resolve(empty)
  return read(projectIds?.join(','))
}

export function scopeKey(projectIds: ProjectScope): string | null {
  return projectIds ? projectIds.join(',') || '-' : null
}
