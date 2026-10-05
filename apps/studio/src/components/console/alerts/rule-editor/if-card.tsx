import { Field, FieldLabel } from '@code-whiskers/ui/components/field'
import { Input } from '@code-whiskers/ui/components/input'
import { NativeSelect, NativeSelectOption } from '@code-whiskers/ui/components/native-select'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconFilter } from '@tabler/icons-react'
import { ENVIRONMENT_SUGGESTIONS, LEVEL_OPTIONS, REVIEW_TRIGGERS } from '../shared/rule-copy'
import { EditorCard } from './editor-card'
import type { CardProps } from './lib'

const CHIP =
  'focus-ring inline-flex h-6 items-center rounded-full border px-2.5 text-2xs transition-colors duration-fast'

export function IfCard({ model }: CardProps) {
  const { draft, dispatch, projects } = model
  const isReview = draft.triggers.some((trigger) => REVIEW_TRIGGERS.includes(trigger))

  return (
    <EditorCard
      step="If"
      title="it matches"
      description={
        isReview
          ? 'Reviews follow the projects’ linked repositories; the event filters do not apply.'
          : 'Leave a filter empty to match everything in this installation.'
      }
      icon={<IconFilter stroke={1.75} />}
    >
      <div className="flex flex-col gap-2">
        <span className="text-2xs text-muted-foreground">Projects</span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Projects">
          <button
            type="button"
            aria-pressed={draft.projectIds.length === 0}
            onClick={() => dispatch({ kind: 'set', patch: { projectIds: [] } })}
            className={cn(
              CHIP,
              draft.projectIds.length === 0
                ? 'border-foreground/30 bg-surface-selected text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            Any project
          </button>
          {projects.map((project) => {
            const isChosen = draft.projectIds.includes(project.id)
            return (
              <button
                key={project.id}
                type="button"
                aria-pressed={isChosen}
                onClick={() => dispatch({ kind: 'toggle-project', projectId: project.id })}
                className={cn(
                  CHIP,
                  isChosen
                    ? 'animate-enter-scale border-foreground/30 bg-surface-selected text-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {project.name}
              </button>
            )
          })}
        </div>
      </div>
      {!isReview && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="rule-environment">Environment</FieldLabel>
            <Input
              id="rule-environment"
              list="rule-environments"
              placeholder="Any"
              value={draft.environment}
              onChange={(event) =>
                dispatch({ kind: 'set', patch: { environment: event.target.value } })
              }
              className="font-mono"
            />
            <datalist id="rule-environments">
              {ENVIRONMENT_SUGGESTIONS.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </Field>
          <Field>
            <FieldLabel htmlFor="rule-level">Level</FieldLabel>
            <NativeSelect
              id="rule-level"
              value={draft.minLevel ?? ''}
              onChange={(event) =>
                dispatch({
                  kind: 'set',
                  patch: {
                    minLevel:
                      LEVEL_OPTIONS.find((option) => option.value === event.target.value)?.value ||
                      null,
                  },
                })
              }
              className="w-full"
            >
              {LEVEL_OPTIONS.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="rule-release">Release</FieldLabel>
            <Input
              id="rule-release"
              placeholder="Any"
              value={draft.release}
              onChange={(event) =>
                dispatch({ kind: 'set', patch: { release: event.target.value } })
              }
              className="font-mono"
            />
          </Field>
        </div>
      )}
    </EditorCard>
  )
}
