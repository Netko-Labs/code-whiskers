import { Link } from '@tanstack/react-router'
import type { SkipLinkProps } from './lib'

const SKIP = 'shrink-0 text-[12px] text-muted-foreground transition-colors hover:text-foreground'

export function SkipLink({ projectId }: SkipLinkProps) {
  return projectId ? (
    <Link to="/console/projects/$projectId" params={{ projectId }} className={SKIP}>
      Skip, I'll do it later
    </Link>
  ) : (
    <Link
      to="/console/$section"
      params={{ section: 'issues' }}
      search={{ tab: 0 }}
      className={SKIP}
    >
      Skip, I'll do it later
    </Link>
  )
}
