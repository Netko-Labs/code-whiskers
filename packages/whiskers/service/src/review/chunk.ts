import parseDiff from 'parse-diff'

/**
 * Files a reviewer has nothing useful to say about: machine-written, vendored,
 * binary, or mechanically translated. Reviewing them burns tokens and buries
 * the findings that matter.
 *
 * Deliberately NOT here: migrations (`drizzle/*.sql`) and CI workflows. Both are
 * generated or boilerplate-ish, and both are exactly where a destructive change
 * hides.
 */
const SKIP_PATTERNS = [
  // Dependency manifests resolved by a tool
  /\.lock$/,
  /^bun\.lock/,
  /-lock\.(json|yaml)$/,
  /(^|\/)go\.sum$/,
  // Build products and bundles
  /\.min\.(js|css)$/,
  /\.map$/,
  /(^|\/)(dist|\.output|\.next|\.nuxt|\.turbo|build|out|target|coverage)\//,
  // Generated source
  /\.gen\.(ts|tsx|js|jsx)$/,
  /\.generated\./,
  /\.pb\.go$/,
  /_pb2\.pyi?$/,
  /\.g\.dart$/,
  /(^|\/)(generated|__generated__|__snapshots__)\//,
  /\.snap$/,
  // Vendored trees
  /(^|\/)(node_modules|vendor|third_party|\.venv)\//,
  // Binary and media
  /\.(svg|png|jpe?g|gif|ico|webp|avif|woff2?|ttf|otf|eot)$/,
  /\.(pdf|zip|gz|tar|wasm|mp4|mov|mp3|wav)$/,
  // Bulk data and translations
  /\.(csv|tsv|parquet|sqlite|db)$/,
  /\.(po|mo|xliff|strings)$/,
  // Release plumbing
  /(^|\/)CHANGELOG\.md$/,
  /(^|\/)LICENSE(\.[a-z]+)?$/i,
]

// Small enough that a flash-tier model answers inside the per-chunk timeout
const MAX_CHUNK_CHARS = 24_000
/**
 * One file big enough to eat a whole chunk is almost always machine-written
 * something we have no pattern for. Note it and move on rather than drop it
 * silently — the model should know it was there.
 */
const MAX_FILE_CHARS = 12_000

function reviewable(fileName: string): boolean {
  return !SKIP_PATTERNS.some((pattern) => pattern.test(fileName))
}

function fileNameOf(section: string): string | undefined {
  return section.match(/^diff --git a\/.+ b\/(.+)$/m)?.[1]
}

function elide(section: string, file: string): string {
  const lines = section.split('\n').length
  return (
    `diff --git a/${file} b/${file}\n` +
    `[${lines} lines, ${section.length} chars — too large to review inline; ` +
    'skipped. Flag it only if its filename suggests a risk.]\n'
  )
}

/** Split a unified diff on file boundaries, drop noise files, pack greedily. */
export function chunkDiff(diff: string, maxChars = MAX_CHUNK_CHARS): string[] {
  const sections = diff.split(/^(?=diff --git )/m).filter((s) => s.trim().length > 0)
  const kept: string[] = []
  for (const section of sections) {
    const file = fileNameOf(section)
    if (file && !reviewable(file)) continue
    kept.push(file && section.length > MAX_FILE_CHARS ? elide(section, file) : section)
  }

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

/**
 * Halve a chunk on file boundaries. A chunk that times out is usually just too
 * much for the model to answer inside the window, and two smaller prompts
 * almost always land where a retry of the same one would time out again.
 * Returns `[chunk]` when there is nothing to split on.
 */
export function splitChunk(chunk: string): string[] {
  const sections = chunk.split(/^(?=diff --git )/m).filter((s) => s.trim().length > 0)
  if (sections.length < 2) return [chunk]

  const half = chunk.length / 2
  let taken = 0
  let cut = 0
  for (const [index, section] of sections.entries()) {
    taken += section.length
    cut = index + 1
    if (taken >= half) break
  }
  // A single section larger than half would otherwise claim every one of them.
  if (cut >= sections.length) cut = sections.length - 1

  return [sections.slice(0, cut).join(''), sections.slice(cut).join('')]
}
