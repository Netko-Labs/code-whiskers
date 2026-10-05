import { Button, buttonVariants } from '@code-whiskers/ui/components/button'
import { Field, FieldLabel } from '@code-whiskers/ui/components/field'
import { Input } from '@code-whiskers/ui/components/input'
import { NativeSelect, NativeSelectOption } from '@code-whiskers/ui/components/native-select'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Page, PageBody, PageHeader } from '@/components/shared/page'
import { StatusBadge } from '@/components/shared/status'
import { alertFiringsQuery } from '@/integrations/alerts-api'
import { formatAge } from '@/shared/format-date'
import { STATE_COPY } from '../shared/rule-copy'
import { EditorCard, StepConnector } from './editor-card'
import { IfCard } from './if-card'
import { type RuleEditorProps, useRuleEditor, useRulePreview } from './lib'
import { RuleHistory } from './rule-history'
import { RuleSummary } from './rule-summary'
import { ThenCard } from './then-card'
import { WhenCard } from './when-card'

export function RuleEditor({ initial, rule }: RuleEditorProps) {
  const model = useRuleEditor(initial, rule)
  const preview = useRulePreview(model.draft)
  const firings = useQuery({ ...alertFiringsQuery(rule?.id), enabled: Boolean(rule) })
  const { draft, dispatch } = model
  const canSave = !model.problem && model.isDirty && !model.isSaving

  return (
    <Page>
      <PageHeader
        title={rule ? rule.name : 'New alert rule'}
        meta={
          rule && (
            <>
              <StatusBadge tone={STATE_COPY[rule.state].tone}>
                {STATE_COPY[rule.state].label}
              </StatusBadge>
              <span>
                last fired{' '}
                <span className="font-mono tabular-nums">
                  {rule.lastFiredAt ? `${formatAge(rule.lastFiredAt)} ago` : 'never'}
                </span>
              </span>
              {rule.defaultFor && <span>created with project {rule.defaultFor}</span>}
            </>
          )
        }
        actions={
          <>
            {rule && (
              <Button
                size="sm"
                variant="destructive"
                onClick={model.remove}
                disabled={model.isSaving}
              >
                Delete
              </Button>
            )}
            <Link
              to="/console/alerts"
              className={buttonVariants({ size: 'sm', variant: 'outline' })}
            >
              {rule ? 'Back' : 'Cancel'}
            </Link>
            <Button size="sm" type="submit" form="rule-editor" disabled={!canSave}>
              {model.isSaving ? 'Saving…' : rule ? 'Save changes' : 'Create rule'}
            </Button>
          </>
        }
      />
      <PageBody>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form
            id="rule-editor"
            className="flex min-w-0 flex-col"
            onSubmit={(event) => {
              event.preventDefault()
              if (canSave) model.save()
            }}
          >
            <EditorCard step="Rule" title="name it" icon={<span className="font-mono">#</span>}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="rule-name">Name</FieldLabel>
                  <Input
                    id="rule-name"
                    value={draft.name}
                    placeholder="Checkout errors in production"
                    onChange={(event) =>
                      dispatch({ kind: 'set', patch: { name: event.target.value } })
                    }
                  />
                </Field>
                {model.installations.length > 1 && (
                  <Field>
                    <FieldLabel htmlFor="rule-installation">Installation</FieldLabel>
                    <NativeSelect
                      id="rule-installation"
                      value={String(draft.installationId ?? '')}
                      disabled={Boolean(rule)}
                      onChange={(event) =>
                        dispatch({
                          kind: 'set',
                          patch: {
                            installationId: Number(event.target.value),
                            projectIds: [],
                            destinationIds: [],
                          },
                        })
                      }
                      className="w-full"
                    >
                      {model.installations.map((org) => (
                        <NativeSelectOption
                          key={org.installationId}
                          value={String(org.installationId)}
                        >
                          {org.name ?? org.login}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                )}
              </div>
            </EditorCard>
            <StepConnector />
            <WhenCard model={model} />
            <StepConnector />
            <IfCard model={model} />
            <StepConnector />
            <ThenCard model={model} />
          </form>
          <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
            <RuleSummary model={model} preview={preview} />
            {rule && <RuleHistory firings={firings.data} />}
          </aside>
        </div>
      </PageBody>
    </Page>
  )
}
