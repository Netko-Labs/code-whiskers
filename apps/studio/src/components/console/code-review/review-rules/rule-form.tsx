import { Button } from '@code-whiskers/ui/components/button'
import { DialogFooter } from '@code-whiskers/ui/components/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@code-whiskers/ui/components/field'
import { Input } from '@code-whiskers/ui/components/input'
import { NativeSelect, NativeSelectOption } from '@code-whiskers/ui/components/native-select'
import { Textarea } from '@code-whiskers/ui/components/textarea'
import { cn } from '@code-whiskers/ui/lib/utils'
import { SeverityDot } from '@/components/shared/status'
import { EFFECT_META, EFFECT_ORDER, EXAMPLE_RULE, type RuleFormProps, useRuleForm } from './lib'

export function RuleForm({ initial, organizations, onDone }: RuleFormProps) {
  const form = useRuleForm(initial)
  const { draft } = form
  const isPickingInstallation = !draft.id && organizations.length > 1

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void form.submit().then((isSaved) => isSaved && onDone())
      }}
      className="flex flex-col gap-5"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="rule-body">Rule</FieldLabel>
          <Textarea
            id="rule-body"
            autoFocus
            rows={4}
            value={draft.body}
            placeholder={EXAMPLE_RULE.body}
            onChange={(event) => form.update({ body: event.target.value })}
          />
          <FieldDescription>Say it the way you would tell a new reviewer.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="rule-scope">Applies to</FieldLabel>
          <Input
            id="rule-scope"
            value={draft.scope}
            className="font-mono"
            placeholder="**"
            onChange={(event) => form.update({ scope: event.target.value })}
          />
          <FieldDescription>
            A path glob such as <code className="font-mono">src/billing/**</code>;{' '}
            <code className="font-mono">**</code> means every file.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel id="rule-effect">Effect</FieldLabel>
          <div
            role="radiogroup"
            aria-labelledby="rule-effect"
            className="grid gap-1.5 sm:grid-cols-2"
          >
            {EFFECT_ORDER.map((effect) => {
              const meta = EFFECT_META[effect]
              const isOn = draft.effect === effect
              return (
                <button
                  key={effect}
                  type="button"
                  role="radio"
                  aria-checked={isOn}
                  onClick={() => form.update({ effect })}
                  className={cn(
                    'focus-ring flex flex-col gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors duration-fast',
                    isOn
                      ? 'border-foreground/40 bg-surface-selected'
                      : 'border-border hover:bg-surface-hover',
                  )}
                >
                  <span className="flex items-center gap-1.5 font-medium text-ui">
                    <SeverityDot tone={meta.tone} size="sm" />
                    {meta.label}
                  </span>
                  <span className="text-2xs text-muted-foreground">{meta.hint}</span>
                </button>
              )
            })}
          </div>
        </Field>
        {isPickingInstallation && (
          <Field>
            <FieldLabel htmlFor="rule-installation">Installation</FieldLabel>
            <NativeSelect
              id="rule-installation"
              value={draft.installationId}
              onChange={(event) => form.update({ installationId: event.target.value })}
            >
              {organizations.map((org) => (
                <NativeSelectOption key={org.installationId} value={String(org.installationId)}>
                  {org.name ?? org.login}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldDescription>The rule applies to every repository it can see.</FieldDescription>
          </Field>
        )}
        {form.error && (
          <p role="alert" className="m-0 animate-enter text-severity-error-ink text-ui">
            {form.error}
          </p>
        )}
      </FieldGroup>
      <DialogFooter>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={form.isSaving}>
          {form.isSaving ? 'Saving…' : draft.id ? 'Save changes' : 'Save rule'}
        </Button>
      </DialogFooter>
    </form>
  )
}
