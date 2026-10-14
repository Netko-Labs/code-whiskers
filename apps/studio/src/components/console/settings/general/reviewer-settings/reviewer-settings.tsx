import { REVIEWER_EFFORTS } from '@code-whiskers/studio-domain'
import { Button } from '@code-whiskers/ui/components/button'
import { NativeSelect, NativeSelectOption } from '@code-whiskers/ui/components/native-select'
import { ErrorState } from '@/components/shared/empty-state'
import { Panel, PanelSkeleton, SettingRow } from '@/components/shared/page'
import {
  catalogProviderOf,
  LIMIT_FIELDS,
  MENTION_MODEL_FIELD,
  MODEL_FIELDS,
  useReviewerSettingsForm,
} from './lib'
import { ReviewerModelField } from './reviewer-model-field'
import { ReviewerProviderSelect } from './reviewer-provider-select'
import { ReviewerTextField } from './reviewer-text-field'

export function ReviewerSettings() {
  const form = useReviewerSettingsForm()

  if (form.isLoading) return <PanelSkeleton rows={7} />
  if (form.isError) {
    return (
      <ErrorState
        size="inline"
        description="Studio did not return the reviewer settings."
        onRetry={form.retry}
      />
    )
  }

  return (
    <Panel
      title="Reviewer settings"
      description="Empty inherits the worker's env, then the provider's default; reviews pick a save up within a minute"
      actions={
        form.isDirty && (
          <div className="flex animate-enter-scale items-center gap-2">
            <Button size="sm" variant="ghost" onClick={form.reset}>
              Discard
            </Button>
            <Button size="sm" disabled={!!form.error || form.isPending} onClick={form.save}>
              {form.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        )
      }
      isFlush
    >
      <ReviewerProviderSelect
        id="reviewer-provider"
        label="Provider"
        description="One call per diff slice, or an agent over a read-only checkout (Claude)"
        inheritLabel="Inherit"
        value={form.draft.provider}
        onChange={(value) => form.setField('provider', value)}
      />
      {MODEL_FIELDS.map((spec) => (
        <ReviewerModelField
          key={spec.field}
          spec={spec}
          provider={catalogProviderOf(spec, form.catalogProviders)}
          value={form.draft[spec.field]}
          onChange={(value) => form.setField(spec.field, value)}
        />
      ))}
      <ReviewerProviderSelect
        id="reviewer-mention-provider"
        label="Mention provider"
        description="Answers @code-whiskers mentions and fix requests; any provider, with its key below"
        inheritLabel="Inherit (OpenRouter)"
        value={form.draft.mentionProvider}
        onChange={(value) => form.setField('mentionProvider', value)}
      />
      <ReviewerModelField
        spec={MENTION_MODEL_FIELD}
        provider={catalogProviderOf(MENTION_MODEL_FIELD, form.catalogProviders)}
        value={form.draft.mentionModel}
        onChange={(value) => form.setField('mentionModel', value)}
      />
      <SettingRow
        label="Effort"
        htmlFor="reviewer-effort"
        description="How hard an agent run thinks; Claude only"
      >
        <NativeSelect
          id="reviewer-effort"
          value={form.draft.effort}
          onChange={(event) => form.setField('effort', event.target.value)}
        >
          <NativeSelectOption value="">Inherit</NativeSelectOption>
          {REVIEWER_EFFORTS.map((effort) => (
            <NativeSelectOption key={effort} value={effort}>
              {effort}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </SettingRow>
      {LIMIT_FIELDS.map((spec) => (
        <ReviewerTextField
          key={spec.field}
          spec={spec}
          value={form.draft[spec.field]}
          onChange={(value) => form.setField(spec.field, value)}
          onSubmit={form.save}
        />
      ))}
      {form.isDirty && form.error && (
        <p role="alert" className="m-0 animate-enter px-4 py-2 text-2xs text-severity-error-ink">
          {form.error}
        </p>
      )}
    </Panel>
  )
}
