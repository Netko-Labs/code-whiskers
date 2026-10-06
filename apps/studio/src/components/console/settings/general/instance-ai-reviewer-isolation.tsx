import { SettingRow } from '@/components/shared/page'
import { StatusBadge } from '@/components/shared/status'
import { type InstanceReviewerIsolationProps, JAIL_PROBE_PASSED } from './lib'

/** REVIEW_AGENT_SANDBOX, what it resolved to and why, and what the boot probe found. */
export function InstanceAiReviewerIsolation({ isolation }: InstanceReviewerIsolationProps) {
  const { jail } = isolation
  return (
    <>
      <SettingRow label="Isolation" description={isolation.reason}>
        <span className="font-mono text-ui">REVIEW_AGENT_SANDBOX={isolation.mode}</span>
      </SettingRow>
      {jail && (
        <SettingRow label="Jail probe" description={jail.reason ?? JAIL_PROBE_PASSED}>
          <StatusBadge tone={jail.landlockAbi && jail.landlockAbi >= 4 ? 'resolved' : 'warning'}>
            <span className="font-mono">Landlock {jail.landlockAbi ?? 'off'}</span>
          </StatusBadge>
          <StatusBadge tone={jail.canDropUid ? 'resolved' : 'neutral'}>
            {jail.canDropUid ? 'Drops root' : 'Worker uid'}
          </StatusBadge>
          <StatusBadge tone={jail.hasSeccomp ? 'resolved' : 'warning'}>
            {jail.hasSeccomp ? 'seccomp' : 'No seccomp'}
          </StatusBadge>
        </SettingRow>
      )}
    </>
  )
}
