import { posix } from 'node:path'
import { fetchFileAtRef, octokitFor, type PrRef } from './github'
import type { ConventionFile } from './types'

const CONVENTION_NAMES = new Set(['CLAUDE.md', 'AGENTS.md'])
// Rides in front of every chunk, like the rest of the preamble — enough for a real CLAUDE.md.
const BUDGET_CHARS = 9_000
const MAX_FILES = 6
const MAX_IMPORTS = 4
// A truncated tree falls back to asking for each candidate path; bounded, shallowest first.
const MAX_PROBED_DIRS = 8
const IMPORT = /(?:^|\s)@((?:\.{1,2}\/)?[\w-][\w./-]*\.md)\b/g

/** The root and every ancestor directory of a changed file: where a convention file applies. */
export function applicableDirectories(files: string[]): Set<string> {
  const dirs = new Set([''])
  for (const file of files) {
    const parts = file.split('/').slice(0, -1)
    for (let depth = 1; depth <= parts.length; depth += 1) dirs.add(parts.slice(0, depth).join('/'))
  }
  return dirs
}

/** `@docs/conventions.md` in a CLAUDE.md pulls that file in, resolved from the importing file. */
export function importsOf(content: string, fromPath: string): string[] {
  const base = posix.dirname(fromPath)
  const found = new Set<string>()
  for (const match of content.matchAll(IMPORT)) {
    const target = match[1]
    if (!target) continue
    const resolved = posix.normalize(posix.join(base, target))
    if (!resolved.startsWith('..')) found.add(resolved)
  }
  return [...found].slice(0, MAX_IMPORTS)
}

function depthOf(path: string): number {
  return path.split('/').length
}

/** Where a convention file would sit for these directories, root first. */
export function candidatePaths(dirs: Set<string>): string[] {
  return [...dirs]
    .sort((a, b) => (a === '' ? 0 : depthOf(a)) - (b === '' ? 0 : depthOf(b)))
    .slice(0, MAX_PROBED_DIRS)
    .flatMap((dir) => [...CONVENTION_NAMES].map((name) => (dir ? `${dir}/${name}` : name)))
}

/**
 * The repository's own instructions for agents — CLAUDE.md and AGENTS.md at the root and above
 * each changed file, plus what they import — read at the head being reviewed.
 */
export async function fetchConventions(
  ref: PrRef,
  headSha: string,
  changedFiles: string[],
): Promise<ConventionFile[]> {
  const octokit = await octokitFor(ref.owner, ref.repo)
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
    owner: ref.owner,
    repo: ref.repo,
    tree_sha: headSha,
    recursive: '1',
  })
  const dirs = applicableDirectories(changedFiles)
  // A huge repository gets a truncated tree; listing it would silently miss conventions.
  const listed = data.truncated
    ? candidatePaths(dirs)
    : data.tree
        .filter((entry) => entry.type === 'blob' && entry.path)
        .map((entry) => entry.path as string)
        .filter((path) => CONVENTION_NAMES.has(posix.basename(path)))
        .filter((path) => dirs.has(posix.dirname(path) === '.' ? '' : posix.dirname(path)))
        .sort((a, b) => depthOf(a) - depthOf(b))

  const read = (path: string) =>
    fetchFileAtRef(ref, path, headSha)
      .then((content) => ({ path, content }))
      .catch(() => null)
  const files = (await Promise.all(listed.map(read)))
    .filter((file) => file !== null)
    .slice(0, MAX_FILES)
  const seen = new Set(files.map((file) => file.path))
  const imported = files
    .flatMap((file) => importsOf(file.content, file.path))
    .filter((path) => !seen.has(path))
  const extra = (await Promise.all([...new Set(imported)].map(read))).filter(
    (file) => file !== null,
  )
  return [...files, ...extra]
}

/** Each file gets an even share of the budget; a long one is cut, never the list. */
export function buildConventionsContext(files: ConventionFile[]): string {
  if (files.length === 0) return ''
  const share = Math.floor(BUDGET_CHARS / files.length)
  const blocks = files.map((file) => {
    const body = file.content.trim()
    const clipped = body.length > share ? `${body.slice(0, share - 1)}…` : body
    return `### ${file.path}\n${clipped}`
  })
  return `## Project conventions — this repository's CLAUDE.md / AGENTS.md

Review the diff against these. A clear violation in a changed line is a finding with category
"convention"; cite the rule in one clause. Code that follows them is correct — never flag it.

${blocks.join('\n\n')}`
}
