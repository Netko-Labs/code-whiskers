import type { PatternPart } from './types'

const PLACEHOLDER = /(<(?:n|hex|uuid|email|str)>)/

/** Literal text and the placeholders grouping put in its place, for dimming the variable parts. */
export function patternParts(pattern: string): PatternPart[] {
  return pattern
    .split(PLACEHOLDER)
    .filter(Boolean)
    .map((text) => ({ text, isVariable: PLACEHOLDER.test(text) }))
}

/** The longest literal run: a plain-text search that finds this pattern's lines. */
export function literalOf(pattern: string): string | undefined {
  const longest = patternParts(pattern)
    .filter((part) => !part.isVariable)
    .map((part) => part.text.trim())
    .sort((a, b) => b.length - a.length)[0]
  return longest && longest.length >= 3 ? longest : undefined
}
