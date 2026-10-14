import { SettingsPage } from '../shared/settings-ui'
import { InstanceAiReviewer } from './instance-ai-reviewer'
import { InstanceHealth } from './instance-health'
import { InstanceIdentity } from './instance-identity'
import { InstanceSetup } from './instance-setup'
import { InstanceUsage } from './instance-usage'
import { ReviewerCredentials, ReviewerSettings } from './reviewer-settings'

export function SettingsGeneral() {
  return (
    <SettingsPage
      title="General"
      description="This self-hosted instance: its name, whether the worker answers, which AI reviewer it runs and with which keys, what is left to set up and what it holds."
    >
      <InstanceIdentity />
      <InstanceHealth />
      <InstanceAiReviewer />
      <ReviewerSettings />
      <ReviewerCredentials />
      <InstanceSetup />
      <InstanceUsage />
    </SettingsPage>
  )
}
