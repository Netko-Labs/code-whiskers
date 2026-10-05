import { Input } from '@code-whiskers/ui/components/input'
import { IconBolt } from '@tabler/icons-react'
import { isRateRule, TRIGGER_GROUPS } from '../shared/rule-copy'
import { EditorCard } from './editor-card'
import { type CardProps, MAX_THRESHOLD, MAX_WINDOW_MINUTES } from './lib'
import { TriggerOption } from './trigger-option'

const NUMBER_INPUT = 'h-7 w-24 font-mono tabular-nums'

export function WhenCard({ model }: CardProps) {
  const { draft, dispatch } = model

  return (
    <EditorCard
      step="When"
      title="this happens"
      description="New and regressed can share a rule; volume and review triggers stand alone."
      icon={<IconBolt stroke={1.75} />}
    >
      {TRIGGER_GROUPS.map((group) => (
        <fieldset key={group.label} className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-2 p-0 text-2xs text-muted-foreground">{group.label}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.triggers.map((trigger) => (
              <TriggerOption
                key={trigger}
                trigger={trigger}
                isCombinable={group.isCombinable}
                isChosen={draft.triggers.includes(trigger)}
                onToggle={() => dispatch({ kind: 'toggle-trigger', trigger })}
              />
            ))}
          </div>
        </fieldset>
      ))}
      {isRateRule(draft.triggers) && (
        <div className="flex animate-enter-up flex-wrap items-center gap-2 rounded-lg bg-surface-subtle px-3 py-2.5 text-ui">
          <span className="text-muted-foreground">At least</span>
          <Input
            type="number"
            aria-label="Event threshold"
            min={1}
            max={MAX_THRESHOLD}
            value={draft.threshold}
            onChange={(event) =>
              dispatch({ kind: 'set', patch: { threshold: event.target.valueAsNumber || 0 } })
            }
            className={NUMBER_INPUT}
          />
          <span className="text-muted-foreground">events within</span>
          <Input
            type="number"
            aria-label="Window in minutes"
            min={1}
            max={MAX_WINDOW_MINUTES}
            value={draft.windowMinutes}
            onChange={(event) =>
              dispatch({ kind: 'set', patch: { windowMinutes: event.target.valueAsNumber || 0 } })
            }
            className={NUMBER_INPUT}
          />
          <span className="text-muted-foreground">minutes</span>
        </div>
      )}
    </EditorCard>
  )
}
