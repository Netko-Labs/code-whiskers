import { DataList, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { draftOf, isOnRuleTab, type ReviewRulesBodyProps } from './lib'
import { ReviewRuleRow } from './review-rule-row'
import { RulesEmpty } from './rules-empty'

export function ReviewRulesBody({ state, tab, onEdit }: ReviewRulesBodyProps) {
  if (state.isLoading) return <DataListSkeleton rows={4} density="auto" />
  if (state.isError) {
    return <ErrorState description="Studio could not list the rules." onRetry={state.refetch} />
  }
  if (state.rules.length === 0) {
    return (
      <RulesEmpty
        hasOrganizations={state.organizations.length > 0}
        organizations={state.organizations}
        onWrite={onEdit}
      />
    )
  }

  const visible = state.rules.filter((rule) => isOnRuleTab(rule, tab))
  if (visible.length === 0) {
    return (
      <EmptyState
        size="inline"
        expression="sleeping"
        title={tab === 'muted' ? 'Nothing muted' : 'Every rule is muted'}
        description="Switch tabs to see the rest."
      />
    )
  }

  return (
    <>
      <DataList label="Review rules" isDivided>
        {visible.map((rule) => (
          <ReviewRuleRow key={rule.id} rule={rule} onEdit={() => onEdit(draftOf(rule))} />
        ))}
      </DataList>
      <p className="m-0 px-gutter py-4 text-2xs text-faint">
        Read on every pull request in the installation · changes apply within a minute
      </p>
    </>
  )
}
