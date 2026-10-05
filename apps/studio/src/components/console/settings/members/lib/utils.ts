import type { Member } from '@/integrations/studio-api'

/** You first, then everyone else by name. */
export function sortMembers(members: Member[], viewerId: string | undefined): Member[] {
  return [...members].sort((a, b) => {
    if (a.id === viewerId) return -1
    if (b.id === viewerId) return 1
    return a.name.localeCompare(b.name)
  })
}

export function filterMembers(members: Member[], query: string): Member[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return members
  return members.filter((member) =>
    [member.name, member.githubLogin ?? '', ...member.organizations].some((value) =>
      value.toLowerCase().includes(needle),
    ),
  )
}
