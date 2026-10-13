export function textOrNull(text: string | null | undefined): string | null {
  return text?.trim() || null
}
