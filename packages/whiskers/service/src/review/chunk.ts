import parseDiff from 'parse-diff'

const SKIP_PATTERNS = [/\.lock$/, /^bun\.lock/, /-lock\.(json|yaml)$/, /\.min\.(js|css)$/, /\.map$/]
const MAX_CHUNK_CHARS = 60_000

function reviewable(fileName: string): boolean {
  return !SKIP_PATTERNS.some((pattern) => pattern.test(fileName))
}

/** Split a unified diff on file boundaries, drop noise files, pack greedily. */
export function chunkDiff(diff: string, maxChars = MAX_CHUNK_CHARS): string[] {
  const sections = diff.split(/^(?=diff --git )/m).filter((s) => s.trim().length > 0)
  const kept = sections.filter((section) => {
    const file = section.match(/^diff --git a\/.+ b\/(.+)$/m)?.[1]
    return file ? reviewable(file) : true
  })

  const chunks: string[] = []
  let current = ''
  for (const section of kept) {
    if (current && current.length + section.length > maxChars) {
      chunks.push(current)
      current = ''
    }
    current += section
  }
  if (current) chunks.push(current)
  return chunks
}

/**
 * Map of file -> line numbers that actually exist on the new side of the diff.
 * GitHub rejects review comments anchored to lines outside the hunks, so
 * findings pointing elsewhere get demoted to the summary.
 */
export function commentableLines(diff: string): Map<string, Set<number>> {
  const map = new Map<string, Set<number>>()
  for (const file of parseDiff(diff)) {
    const name = file.to ?? file.from
    if (!name || name === '/dev/null') continue
    const lines = map.get(name) ?? new Set<number>()
    for (const chunk of file.chunks) {
      for (const change of chunk.changes) {
        if (change.type === 'add') lines.add(change.ln)
        if (change.type === 'normal') lines.add(change.ln2)
      }
    }
    map.set(name, lines)
  }
  return map
}
