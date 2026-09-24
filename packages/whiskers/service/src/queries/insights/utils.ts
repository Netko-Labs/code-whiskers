import { HOTSPOT_DIRECTORY_DEPTH } from './constants'

/** `apps/studio/src/components/x.tsx` → `apps/studio/src`; a root file sits in `.`. */
export function directoryOf(file: string, depth = HOTSPOT_DIRECTORY_DEPTH): string {
  const directories = file.split('/').slice(0, -1).filter(Boolean)
  return directories.slice(0, depth).join('/') || '.'
}

/** Raw SQL returns Date objects; stringifying one drops its milliseconds. */
export function asDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value))
}

/**
 * Two log lines are the same problem when they differ only in ids, counts and quoted values —
 * `user 42 failed` and `user 97 failed` group together.
 */
export function logPattern(message: string): string {
  return message
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<uuid>')
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '<email>')
    .replace(/"[^"]*"|'[^']*'/g, '<str>')
    .replace(/\b[0-9a-f]{8,}\b/gi, '<hex>')
    .replace(/(?<![A-Za-z_\d])\d+(\.\d+)?/g, '<n>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}
