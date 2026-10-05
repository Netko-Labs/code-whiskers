import { Button } from '@code-whiskers/ui/components/button'
import { IconPlus, IconScale } from '@tabler/icons-react'
import { useState } from 'react'
import { Page, PageHeader, PageTabs } from '@/components/shared/page'
import { newDraft, RULE_TABS, type RuleDraft, type RuleTab, useReviewRules } from './lib'
import { ReviewRuleDialog } from './review-rule-dialog'
import { ReviewRulesBody } from './review-rules-body'

export function ReviewRulesPage() {
  const [tab, setTab] = useState<RuleTab>('all')
  const [draft, setDraft] = useState<RuleDraft | null>(null)
  const state = useReviewRules()
  const canWrite = state.organizations.length > 0

  return (
    <Page>
      <PageHeader
        icon={<IconScale stroke={1.75} />}
        title="Review rules"
        description="Plain-English instructions Whiskers follows on every pull request."
        actions={
          canWrite &&
          state.rules.length > 0 && (
            <Button size="sm" onClick={() => setDraft(newDraft(state.organizations))}>
              <IconPlus stroke={1.75} />
              Write a rule
            </Button>
          )
        }
        tabs={
          state.rules.length > 0 && (
            <PageTabs
              label="Rule filter"
              items={RULE_TABS.map((item) => ({
                key: item.key,
                label: item.label,
                count: state.counts[item.key],
                isActive: tab === item.key,
                onSelect: () => setTab(item.key),
              }))}
            />
          )
        }
      />
      <ReviewRulesBody state={state} tab={tab} onEdit={setDraft} />
      <ReviewRuleDialog
        draft={draft}
        organizations={state.organizations}
        onClose={() => setDraft(null)}
      />
    </Page>
  )
}
