import { createLogger } from '@code-whiskers/logger'
import { fetchFileAtRef } from '../../review/github'
import type { OwnerRule } from './types'

const logger = createLogger('whiskers-codeowners')
const CODEOWNERS_PATHS = ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS']
const CACHE_MS = 60 * 60_000
const cache = new Map<string, { at: number; rules: OwnerRule[] }>()

export function parseCodeOwners(text: string): OwnerRule[] {
  return text
    .split('\n')
    .map((line) => line.replace(/#.*$/, '').trim())
    .filter(Boolean)
    .map((line) => {
      const [pattern = '', ...owners] = line.split(/\s+/)
      return { pattern, owners }
    })
    .filter((rule) => rule.pattern)
}

/** CODEOWNERS patterns follow .gitignore: unanchored names match at any depth, a trailing / is a directory. */
function globsFor(pattern: string): string[] {
  if (pattern === '*') return ['**']
  const isAnchored = pattern.startsWith('/') || pattern.slice(0, -1).includes('/')
  const body = pattern.replace(/^\//, '').replace(/\/$/, '')
  const base = isAnchored ? body : `**/${body}`
  return [base, `${base}/**`]
}

/** GitHub's rule: the last matching line wins. */
export function ownersOf(path: string, rules: OwnerRule[]): string[] {
  let owners: string[] = []
  for (const rule of rules) {
    if (globsFor(rule.pattern).some((glob) => new Bun.Glob(glob).match(path))) owners = rule.owners
  }
  return owners
}

export async function codeOwnersFor(repository: string): Promise<OwnerRule[]> {
  const hit = cache.get(repository)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.rules
  const [owner = '', repo = ''] = repository.split('/')
  let rules: OwnerRule[] = []
  for (const path of CODEOWNERS_PATHS) {
    const text = await fetchFileAtRef({ owner, repo }, path, 'HEAD').catch(() => null)
    if (text) {
      rules = parseCodeOwners(text)
      break
    }
  }
  if (rules.length === 0) logger.info({ repository }, 'no CODEOWNERS')
  cache.set(repository, { at: Date.now(), rules })
  return rules
}
