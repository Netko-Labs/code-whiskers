import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Skeleton } from '@code-whiskers/ui/components/skeleton'
import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { CodeBlock } from '../../../shared/project-setup'
import { OTLP_KEY_HEADER, type OtlpSetupProps, otlpEnvSnippet, useOtlpTarget } from './lib'
import { OtlpField } from './otlp-field'

/** The empty state of every telemetry page: where to send OTLP, with a real key to send it with. */
export function OtlpSetup({ title, description }: OtlpSetupProps) {
  const target = useOtlpTarget()

  if (target.isLoading) {
    return <Skeleton className="mx-auto my-16 h-48 w-full max-w-[520px] rounded-xl" />
  }
  if (!target.project || !target.key) {
    return (
      <EmptyState
        title={title}
        description="Telemetry is sent with a project key. Create a project and its key comes with it."
        action={
          <Link to="/console/projects/new" className={buttonVariants({ size: 'sm' })}>
            Set up a project
          </Link>
        }
      />
    )
  }

  return (
    <EmptyState
      title={title}
      description={description}
      secondary={
        <Link
          to="/console/projects/$projectId"
          params={{ projectId: target.project.id }}
          className="text-muted-foreground text-ui underline-offset-4 hover:text-foreground hover:underline"
        >
          Manage {target.project.name} keys
        </Link>
      }
    >
      <div className="flex w-full max-w-[560px] flex-col gap-2 text-left">
        <OtlpField label="Endpoint" value={target.endpoint} copyLabel="Endpoint" />
        <OtlpField
          label="Header"
          value={`${OTLP_KEY_HEADER}: ${target.key.publicKey}`}
          copyLabel="Header"
        />
        <CodeBlock
          snippet={{
            label: 'OpenTelemetry environment',
            code: otlpEnvSnippet(target.endpoint, target.key.publicKey),
          }}
        />
      </div>
    </EmptyState>
  )
}
