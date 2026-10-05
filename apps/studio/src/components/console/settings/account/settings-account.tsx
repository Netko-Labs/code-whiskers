import { Button } from '@code-whiskers/ui/components/button'
import { IconLogout } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { Panel, SettingRow } from '@/components/shared/page'
import { signOut } from '@/integrations/auth'
import { SettingsPage } from '../shared/settings-ui'
import { AccountAppearance } from './account-appearance'
import { AccountProfile } from './account-profile'
import { AccountShortcuts } from './account-shortcuts'

export function SettingsAccount() {
  const navigate = useNavigate()

  return (
    <SettingsPage
      title="Account"
      description="You, as this instance sees you, and how the console looks to you."
    >
      <AccountProfile />
      <AccountAppearance />
      <AccountShortcuts />
      <Panel isFlush>
        <SettingRow label="Sign out" description="Ends this session; other devices stay signed in">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void signOut().then(() => navigate({ to: '/sign-in' }))}
          >
            <IconLogout stroke={1.75} />
            Sign out
          </Button>
        </SettingRow>
      </Panel>
    </SettingsPage>
  )
}
