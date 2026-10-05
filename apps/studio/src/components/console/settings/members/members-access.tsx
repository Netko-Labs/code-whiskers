import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Panel, SettingRow } from '@/components/shared/page'
import { githubPeopleUrl, installationSettingsUrl } from '../lib'
import { ExternalLink } from '../shared/settings-ui'
import type { MembersAccessProps } from './lib'

/** There is no invite here: GitHub decides who belongs, CodeWhiskers follows on sign-in. */
export function MembersAccess({ installations, installUrl }: MembersAccessProps) {
  return (
    <Panel
      title="How access works"
      description="Anyone who signs in with GitHub and belongs to an installation below is a member. To add or remove someone, change it on GitHub; it applies at their next sign-in."
      actions={
        installUrl && (
          <a
            href={installUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ size: 'sm', variant: 'outline' })}
          >
            Install on another account
          </a>
        )
      }
      isFlush
    >
      {installations.map((org) => (
        <SettingRow
          key={org.installationId}
          label={<span className="font-mono text-xs">{org.login}</span>}
          description={org.accountType === 'Organization' ? 'Organization' : 'Personal account'}
        >
          <span className="flex items-center gap-4 text-2xs">
            <ExternalLink href={githubPeopleUrl(org)}>
              {org.accountType === 'Organization' ? 'People' : 'Profile'}
            </ExternalLink>
            <ExternalLink href={installationSettingsUrl(org)}>App access</ExternalLink>
          </span>
        </SettingRow>
      ))}
    </Panel>
  )
}
