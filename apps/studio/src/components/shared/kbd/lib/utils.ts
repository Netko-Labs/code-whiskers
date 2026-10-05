import { KEY_LABELS, MAC_KEY_LABELS } from './values'

export function keyLabel(key: string, isMac: boolean): string {
  const name = key.toLowerCase()
  return (isMac ? MAC_KEY_LABELS[name] : undefined) ?? KEY_LABELS[name] ?? key.toUpperCase()
}

/** Matches `mod+k`-style combos against a keydown, so callers never re-implement modifier logic. */
export function isCombo(event: KeyboardEvent, combo: string): boolean {
  const parts = combo.toLowerCase().split('+')
  const key = parts.at(-1)
  const wantsMod = parts.includes('mod')
  const hasMod = event.metaKey || event.ctrlKey
  return (
    event.key.toLowerCase() === key &&
    wantsMod === hasMod &&
    parts.includes('shift') === event.shiftKey &&
    parts.includes('alt') === event.altKey
  )
}
