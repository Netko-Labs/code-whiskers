import type { Member } from '@/integrations/studio-api'

/** Members load after the triage record, so a known assignee may not have a name yet. */
export function assigneeText(assignee: Member | undefined, assigneeUserId: string | null): string {
  return assignee?.name ?? (assigneeUserId ? 'Assigned' : 'Assign')
}

export function assigneeAriaLabel(
  assignee: Member | undefined,
  assigneeUserId: string | null,
): string {
  if (!assigneeUserId) return 'Assign'
  return `Assigned to ${assignee?.name ?? 'a teammate'} — change assignee`
}
