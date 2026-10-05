import type { ZodType } from 'zod'
import { ResponseError } from '@/integrations/observability'
import { WHISKERS_BASE_PATH, type WhiskersMethod, whiskersErrorBodySchema } from './lib'

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

/** A refusal whiskers explained (`{ error }`) keeps its sentence; anything else names the status. */
async function failureOf(path: string, response: Response): Promise<ResponseError> {
  const body = await response.json().catch(() => null)
  const parsed = whiskersErrorBodySchema.safeParse(body)
  const message = parsed.success
    ? parsed.data.error
    : `whiskers ${path} responded ${response.status}`
  return new ResponseError(message, response.status)
}

export async function fetchWhiskers<T>(path: string, schema: ZodType<T>): Promise<T> {
  const response = await fetch(resolve(path), { headers: { accept: 'application/json' } })
  if (!response.ok) {
    throw new ResponseError(`whiskers ${path} responded ${response.status}`, response.status)
  }

  return schema.parse(await response.json())
}

export async function sendWhiskers<T>(
  method: WhiskersMethod,
  path: string,
  body: unknown,
  schema: ZodType<T>,
): Promise<T> {
  const hasBody = body !== undefined
  const response = await fetch(resolve(path), {
    method,
    headers: {
      accept: 'application/json',
      ...(hasBody && { 'content-type': 'application/json' }),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) throw await failureOf(path, response)
  return schema.parse(await response.json())
}

export const postWhiskers = <T>(path: string, body: unknown, schema: ZodType<T>): Promise<T> =>
  sendWhiskers('POST', path, body, schema)
