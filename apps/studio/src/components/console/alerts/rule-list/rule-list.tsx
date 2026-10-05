import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { DataList, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { SeverityDot } from '@/components/shared/status'
import { useRuleList } from './lib'
import { RuleRow } from './rule-row'
import { RuleTemplates } from './rule-templates'

export function RuleList() {
  const model = useRuleList()

  if (model.isLoading) return <DataListSkeleton rows={5} />
  if (model.isError) return <ErrorState onRetry={model.retry} />
  if (!model.hasInstallation) {
    return (
      <EmptyState
        title="Connect GitHub first"
        description="Alert rules belong to an installation. Install the GitHub App, then come back."
        action={
          <Link
            to="/console/$section"
            params={{ section: 'integrations' }}
            search={{ tab: 2 }}
            className={buttonVariants({ size: 'sm' })}
          >
            Connect GitHub
          </Link>
        }
      />
    )
  }
  if (model.rules.length === 0) {
    return <RuleTemplates hasDestination={model.destinations.length > 0} />
  }

  return (
    <div className="flex flex-col">
      {model.destinations.length === 0 && (
        <div className="flex animate-enter-up items-center gap-3 border-border border-b px-gutter py-3 text-ui">
          <SeverityDot tone="warning" label="Needs a destination" />
          <span className="min-w-0 flex-1 text-muted-foreground">
            Alerts have nowhere to go. Rules stay muted until a destination exists.
          </span>
          <Link
            to="/console/alerts/destinations"
            className={buttonVariants({ size: 'sm', variant: 'outline' })}
          >
            Add a destination
          </Link>
        </div>
      )}
      <DataList label="Alert rules" isDivided>
        {model.rules.map((rule) => (
          <RuleRow
            key={rule.id}
            rule={rule}
            destinations={model.destinations}
            onEnabledChange={(isEnabled) => model.setEnabled(rule, isEnabled)}
          />
        ))}
      </DataList>
      <p className="m-0 px-gutter py-4 text-2xs text-faint">
        Evaluated every minute by the worker · regressions alert the moment ingest sees them
      </p>
    </div>
  )
}
