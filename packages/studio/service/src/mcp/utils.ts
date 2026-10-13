import { PR_REF_PATTERN } from '@code-whiskers/studio-domain'
import { isInstallationMember } from '../queries/github'
import { findRepositoryBySlug } from '../queries/memory'
import type { PrRef, ToolResult } from './types'

export function parsePrRef(value: string): PrRef | null {
  const match = PR_REF_PATTERN.exec(value)
  if (!match?.[1] || !match[2] || !match[3]) return null
  return {
    owner: match[1],
    repo: match[2],
    number: Number(match[3]),
    slug: `${match[1]}/${match[2]}`,
  }
}

/** The key's holder must be in the installation that owns the repository. */
export async function accessibleRepository(userId: string, slug: string) {
  const repository = await findRepositoryBySlug(slug)
  if (!repository) return null
  return (await isInstallationMember(userId, repository.installationId)) ? repository : null
}

export function ok(value: unknown): ToolResult {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 1)
  return { content: [{ type: 'text', text }] }
}

export function fail(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], isError: true }
}

export function globMatches(patterns: string[], files: string[]): boolean {
  const scoped = patterns.filter((path) => path !== '**' && path !== '*')
  if (scoped.length === 0 || files.length === 0) return true
  return scoped.some((path) => {
    const glob = new Bun.Glob(path)
    return files.some((file) => glob.match(file))
  })
}
