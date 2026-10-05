import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { Page, PageBody, PageHeaderSkeleton, PanelSkeleton } from '@/components/shared/page'
import { type RuleEditorPageProps, useRuleSource } from './lib'
import { RuleEditor } from './rule-editor'

/** Loads the rule (or the template) once, then hands the editor a stable starting draft. */
export function RuleEditorPage({ ruleId, template }: RuleEditorPageProps) {
  const source = useRuleSource(ruleId, template)

  if (source.status === 'loading') {
    return (
      <Page>
        <PageHeaderSkeleton />
        <PageBody>
          <PanelSkeleton />
          <PanelSkeleton />
        </PageBody>
      </Page>
    )
  }
  if (source.status === 'error') return <ErrorState onRetry={source.retry} />
  if (source.status === 'missing') {
    return (
      <EmptyState
        expression="confused"
        title="Rule not found"
        description="It was deleted, or it belongs to an installation you cannot see."
        action={
          <Link to="/console/alerts" className={buttonVariants({ size: 'sm' })}>
            Back to alerts
          </Link>
        }
      />
    )
  }
  return (
    <RuleEditor key={ruleId ?? template ?? 'new'} initial={source.initial} rule={source.rule} />
  )
}
