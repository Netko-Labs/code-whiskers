import { Skeleton } from '@code-whiskers/ui/components/skeleton'
import { Panel } from '@/components/shared/page'
import { PersonAvatar } from '../../shared/console-ui'
import { ExternalLink } from '../shared/settings-ui'
import { useAccountProfile } from './lib'

/** Read-only on purpose: GitHub owns the name and the avatar, sign-in copies them. */
export function AccountProfile() {
  const { viewer, githubLogin } = useAccountProfile()

  return (
    <Panel
      title="Profile"
      description="Name and avatar come from GitHub and refresh when you sign in"
      actions={
        <ExternalLink href="https://github.com/settings/profile" className="text-2xs">
          Edit on GitHub
        </ExternalLink>
      }
    >
      {viewer ? (
        <div className="flex items-center gap-4">
          <PersonAvatar
            name={viewer.name}
            image={viewer.image}
            isSelf
            className="size-12 text-ui"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-semibold text-foreground text-ui">{viewer.name}</span>
            <span className="truncate font-mono text-2xs text-muted-foreground">
              {githubLogin ? `@${githubLogin} · ` : ''}
              {viewer.email}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      )}
    </Panel>
  )
}
