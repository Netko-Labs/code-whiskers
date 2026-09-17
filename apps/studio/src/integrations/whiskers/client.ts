import type { ZodType } from 'zod'
import { WHISKERS_BASE_PATH } from './lib'

/** Studio fronts whiskers, so `/v1` is same-origin in the browser and absolute on the server. */
function resolve(path: string): string {
  const base = typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin
  return new URL(`${WHISKERS_BASE_PATH}${path}`, base).toString()
}

export async function fetchWhiskers<T>(path: string, schema: ZodType<T>): Promise<T> {
  const response = await fetch(resolve(path), { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`whiskers ${path} responded ${response.status}`)

  return schema.parse(await response.json())
}
