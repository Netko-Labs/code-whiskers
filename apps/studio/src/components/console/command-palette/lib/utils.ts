import { GO_TARGETS } from '../../lib'
import type { PaletteCommand, PaletteSection } from './types'
import { PALETTE_GROUPS } from './values'

/** Issue ids are opaque tokens: one word, no spaces, long enough not to be a title. */
export function looksLikeIssueId(query: string): boolean {
  return /^[\w-]{12,}$/.test(query.trim())
}

export function groupCommands(commands: PaletteCommand[]): PaletteSection[] {
  return PALETTE_GROUPS.map((group) => ({
    group,
    commands: commands.filter((command) => command.group === group),
  })).filter((entry) => entry.commands.length > 0)
}

/** Pages that also have a `g` jump show it, so the palette teaches the shortcut. */
export function goShortcut(label: string): string[] | undefined {
  const target = GO_TARGETS.find((candidate) => candidate.label === label)
  return target ? ['g', target.key] : undefined
}
