import type { PrFile } from './types'

/**
 * Rebuild a git-style unified diff from the per-file patches GitHub lists. A file GitHub sends no
 * patch for — binary, or too large to render — keeps its header and a note, so it is still seen.
 */
export function diffFromFiles(files: PrFile[]): string {
  return files.map(fileSection).join('')
}

function fileSection(file: PrFile): string {
  const to = file.filename
  const from = file.previousFilename ?? to
  const header = [`diff --git a/${from} b/${to}`]
  if (from !== to) header.push(`rename from ${from}`, `rename to ${to}`)
  if (!file.patch) {
    header.push(`[${file.status}; no patch from GitHub — binary or too large to show.]`)
    return `${header.join('\n')}\n`
  }
  header.push(
    file.status === 'added' ? '--- /dev/null' : `--- a/${from}`,
    file.status === 'removed' ? '+++ /dev/null' : `+++ b/${to}`,
  )
  return `${header.join('\n')}\n${file.patch.endsWith('\n') ? file.patch : `${file.patch}\n`}`
}
