import { Button } from '@code-whiskers/ui/components/button'
import { ErrorState } from '@/components/shared/empty-state'
import { Panel, PanelSkeleton, SettingRow } from '@/components/shared/page'
import { StatusBadge } from '@/components/shared/status'
import { useAiReviewer } from './lib'

/** Env-driven and read-only: which reviewer the worker runs, what it is missing, and a test run. */
export function InstanceAiReviewer() {
  const { reviewer, isLoading, isError, retry, test, isTesting, runTest } = useAiReviewer()

  if (isLoading) return <PanelSkeleton rows={4} />
  if (isError || !reviewer) {
    return (
      <ErrorState
        size="inline"
        description="Whiskers did not say which reviewer it runs."
        onRetry={retry}
      />
    )
  }

  return (
    <Panel
      title="AI reviewer"
      description="Set on the worker with REVIEW_PROVIDER and REVIEW_MODEL"
      actions={
        <Button size="sm" variant="outline" disabled={isTesting} onClick={runTest}>
          {isTesting ? 'Testing…' : 'Test'}
        </Button>
      }
      isFlush
    >
      <SettingRow
        label="Provider"
        description={
          reviewer.isAgentic ? 'Agent over a read-only checkout' : 'One call per diff slice'
        }
      >
        <span className="font-mono text-ui">{reviewer.provider}</span>
        <span className="font-mono text-2xs text-muted-foreground">{reviewer.model}</span>
      </SettingRow>
      <SettingRow
        label="Credentials"
        description="Whether each is set on the worker, never its value"
      >
        {reviewer.credentials.map((credential) => (
          <StatusBadge key={credential.name} tone={credential.isSet ? 'resolved' : 'neutral'}>
            <span className="font-mono">{credential.name}</span>
          </StatusBadge>
        ))}
      </SettingRow>
      {reviewer.problems.map((problem) => (
        <SettingRow key={problem} label="Needs attention" description={problem}>
          <StatusBadge tone="warning">Check</StatusBadge>
        </SettingRow>
      ))}
      {test && (
        <SettingRow
          label="Last test"
          description={test.error ?? `${test.provider} answered with a structured review`}
        >
          <StatusBadge tone={test.isOk ? 'resolved' : 'error'}>
            {test.isOk ? 'Passed' : 'Failed'}
          </StatusBadge>
          <span className="font-mono text-2xs text-muted-foreground tabular-nums">
            {test.latencyMs} ms
          </span>
        </SettingRow>
      )}
    </Panel>
  )
}
