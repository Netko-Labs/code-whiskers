import type { ZodType } from 'zod'
import { WHISKERS_BASE_PATH } from './lib'

/**
 * Studio fronts whiskers, so `/v1` is same-origin. These queries are browser-only: on the server
 * the deployed origin is not knowable from client-bundled code, and guessing one silently fetches
 * the wrong host. Prefetch through a route loader with the server config instead.
 */
function resolve(path: string): string {
  if (typeof window === 'undefined') {
    throw new Error(`whiskers ${path} was requested on the server; these queries are client-only`)
  }
  return new URL(`${WHISKERS_BASE_PATH}${path}`, window.location.origin).toString()
}

export async function fetchWhiskers<T>(path: string, schema: ZodType<T>): Promise<T> {
  const response = await fetch(resolve(path), { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`whiskers ${path} responded ${response.status}`)

  return schema.parse(await response.json())
}

export async function postWhiskers<T>(path: string, body: unknown, schema: ZodType<T>): Promise<T> {
  const response = await fetch(resolve(path), {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`whiskers ${path} responded ${response.status}`)
  return schema.parse(await response.json())
}
