import { fetchFileAtRef, type PrRef } from './github'

const GUIDELINE_FILES = ['CLAUDE.md', 'AGENTS.md']
const IMPORT_PATTERN = /@([\w./-]+\.md)\b/g
// One level of @path imports, bounded — guidelines season the prompt, they
// don't get to fill the context window.
const MAX_IMPORTS = 4
const FILE_CLAMP = 8_000
const TOTAL_CLAMP = 24_000

/** Repo-relative .md paths referenced with the CLAUDE.md `@path` import syntax. */
export function extractImports(content: string): string[] {
  return [...content.matchAll(IMPORT_PATTERN)].map((match) => match[1] as string)
}

/**
 * The repo's own rules for agents: CLAUDE.md and AGENTS.md at the root, plus
 * one level of their @path .md imports, fetched at the PR head. Returns ''
 * when the repo has neither — reviews then run on general standards alone.
 */
export async function fetchRepoGuidelines(ref: PrRef, sha: string): Promise<string> {
  const sections: string[] = []
  const seen = new Set<string>()
  const queue = [...GUIDELINE_FILES]
  let importsLeft = MAX_IMPORTS
  while (queue.length > 0) {
    const path = queue.shift() as string
    if (seen.has(path)) continue
    seen.add(path)
    const content = await fetchFileAtRef(ref, path, sha).catch(() => null)
    if (!content) continue
    sections.push(`--- ${path} ---\n${content.slice(0, FILE_CLAMP)}`)
    for (const imported of extractImports(content)) {
      if (importsLeft <= 0) break
      if (!seen.has(imported)) {
        queue.push(imported)
        importsLeft--
      }
    }
  }
  return sections.join('\n\n').slice(0, TOTAL_CLAMP)
}
