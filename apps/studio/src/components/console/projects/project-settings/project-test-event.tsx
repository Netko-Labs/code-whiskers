import { Button } from '@code-whiskers/ui/components/button'
import { useSendTestEvent } from '../../shared/project-setup'
import type { ProjectSectionProps } from './lib'
import { SettingsSection } from './settings-section'

export function ProjectTestEvent({ project }: ProjectSectionProps) {
  const test = useSendTestEvent(project.id)

  return (
    <SettingsSection
      title="Test event"
      description="Whiskers ingests one synthetic error for this project, through the same path an SDK's takes."
    >
      <Button
        size="sm"
        variant="outline"
        className="self-start"
        disabled={test.isPending}
        onClick={test.send}
      >
        {test.isPending ? 'Sending…' : 'Send test event'}
      </Button>
    </SettingsSection>
  )
}
