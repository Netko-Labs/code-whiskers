const FENCE = /^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/

/**
 * Cheap models wrap JSON in markdown fences or append prose after the object.
 * Returns the trimmed object text, or null when there's nothing to salvage.
 */
export function repairJsonText(text: string): string | null {
  const unfenced = text.match(FENCE)?.[1] ?? text
  const start = unfenced.indexOf('{')
  const end = unfenced.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  const candidate = unfenced.slice(start, end + 1)
  return candidate === text ? null : candidate
}

export async function repairText({ text }: { text: string }): Promise<string | null> {
  return repairJsonText(text)
}
