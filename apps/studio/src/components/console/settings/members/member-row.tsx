import { DataRow, DataRowMeta, DataRowTitle, DataRowTrail } from '@/components/shared/data-list'
import { formatAge } from '@/shared/format-date'
import { PersonAvatar } from '../../shared/console-ui'
import { ExternalLink } from '../shared/settings-ui'
import type { MemberRowProps } from './lib'

/** Read-only on purpose: who belongs, and in what role, is GitHub's decision. */
export function MemberRow({ member, isViewer }: MemberRowProps) {
  const login = member.githubLogin

  return (
    <DataRow density="auto" className="px-4">
      <PersonAvatar
        name={member.name}
        image={member.image}
        isSelf={isViewer}
        className="size-7 text-2xs"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-2">
          <DataRowTitle>{member.name}</DataRowTitle>
          {isViewer && <span className="shrink-0 text-2xs text-muted-foreground">you</span>}
        </span>
        {login ? (
          <ExternalLink
            href={`https://github.com/${login}`}
            className="self-start font-mono text-2xs text-muted-foreground"
          >
            @{login}
          </ExternalLink>
        ) : (
          <span className="truncate text-2xs text-muted-foreground">
            GitHub login recorded at their next sign-in
          </span>
        )}
      </span>
      <DataRowTrail className="gap-4">
        <span className="hidden max-w-40 truncate font-mono text-2xs text-muted-foreground sm:block">
          {member.organizations.join(', ')}
        </span>
        <span className="w-14 text-2xs text-foreground">
          {member.role === 'owner' ? 'Owner' : 'Member'}
        </span>
        <DataRowMeta className="w-16 text-right">
          {member.lastActiveAt ? `${formatAge(member.lastActiveAt)} ago` : '—'}
        </DataRowMeta>
      </DataRowTrail>
    </DataRow>
  )
}
