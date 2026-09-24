const MAX_PROJECTS = 20

export function projectIdsOf(value: string | undefined): string[] | undefined {
  const ids = value
    ?.split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, MAX_PROJECTS)
  return ids?.length ? ids : undefined
}
