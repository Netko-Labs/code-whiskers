import { SettingsPage } from '../shared/settings-ui'
import { InstanceHealth } from './instance-health'
import { InstanceIdentity } from './instance-identity'
import { InstanceSetup } from './instance-setup'
import { InstanceUsage } from './instance-usage'

export function SettingsGeneral() {
  return (
    <SettingsPage
      title="General"
      description="This self-hosted instance: its name, whether the worker answers, what is left to set up and what it holds."
    >
      <InstanceIdentity />
      <InstanceHealth />
      <InstanceSetup />
      <InstanceUsage />
    </SettingsPage>
  )
}
