import { REVIEWER_EFFORTS, REVIEWER_PROVIDERS } from '@code-whiskers/studio-domain'
import { Button } from '@code-whiskers/ui/components/button'
import { NativeSelect, NativeSelectOption } from '@code-whiskers/ui/components/native-select'
import { ErrorState } from '@/components/shared/empty-state'
import { Panel, PanelSkeleton, SettingRow } from '@/components/shared/page'
import { LIMIT_FIELDS, MODEL_FIELDS, PROVIDER_LABEL, useReviewerSettingsForm } from './lib'
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
      <SettingRow
        label="Provider"
        htmlFor="reviewer-provider"
        description="One call per diff slice, or an agent over a read-only checkout (Claude)"
      >
        <NativeSelect
          id="reviewer-provider"
          value={form.draft.provider}
          onChange={(event) => form.setField('provider', event.target.value)}
        >
          <NativeSelectOption value="">Inherit</NativeSelectOption>
          {REVIEWER_PROVIDERS.map((provider) => (
            <NativeSelectOption key={provider} value={provider}>
              {PROVIDER_LABEL[provider]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </SettingRow>
      {MODEL_FIELDS.map((spec) => (
        <ReviewerTextField
          key={spec.field}
          spec={spec}
          value={form.draft[spec.field]}
          onChange={(value) => form.setField(spec.field, value)}
          onSubmit={form.save}
        />
      ))}
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
