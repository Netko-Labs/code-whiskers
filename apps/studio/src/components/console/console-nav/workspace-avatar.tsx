import type { WorkspaceAvatarProps } from './lib'

/** The org's tint is identity, not severity, so it stays a muted pastel square. */
export function WorkspaceAvatar({ org }: WorkspaceAvatarProps) {
  return (
    <span
      className="flex size-5 shrink-0 items-center justify-center rounded-[5px] font-bold text-[9px] text-ink"
      style={{ background: org.tint }}
    >
      {org.mono}
    </span>
  )
}
