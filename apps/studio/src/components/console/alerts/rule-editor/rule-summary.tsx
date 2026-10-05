import { Panel } from '@/components/shared/page'
import { Sparkline } from '@/components/shared/stats'
import { ruleSentence } from '../shared/rule-copy'
import { type PreviewLineProps, type RuleSummaryProps, shapeOfDraft } from './lib'

function PreviewLine({ preview }: PreviewLineProps) {
  if (preview.status === 'idle') return null
  if (preview.status === 'unavailable') {
    return <p className="m-0 text-2xs text-faint">No preview: the worker is not answering.</p>
  }
  if (preview.status === 'loading') {
    return (
      <p className="m-0 animate-enter text-2xs text-muted-foreground">Counting the last 7 days…</p>
    )
  }
  const { count, days, isCapped } = preview.preview
  return (
    <div key={count} className="flex animate-enter items-end justify-between gap-4">
      <p className="m-0 text-2xs text-muted-foreground">
        Would have fired{' '}
        <span className="font-mono text-foreground tabular-nums">
          {isCapped ? `${count.toLocaleString()}+` : count.toLocaleString()}
        </span>{' '}
        {count === 1 ? 'time' : 'times'} in the last 7 days
      </p>
      {count > 0 && (
        <Sparkline
          values={days}
          variant="bars"
          width={70}
          height={18}
          tone="info"
          label="Firings per day, last 7 days"
        />
      )}
    </div>
  )
}

/** The rule read back as one sentence, and how noisy it would have been last week. */
export function RuleSummary({ model, preview }: RuleSummaryProps) {
  const { draft, projects, destinations } = model
  const names = draft.projectIds.map(
    (id) => projects.find((project) => project.id === id)?.name ?? `project ${id}`,
  )
  const chosen = draft.notifyAll
    ? 'all'
    : destinations
        .filter((destination) => draft.destinationIds.includes(destination.id))
        .map((destination) => destination.name)

  return (
    <Panel title="Summary">
      <div className="flex flex-col gap-3">
        <p key={draft.triggers.join()} className="m-0 animate-enter text-pretty text-body text-ui">
          {ruleSentence(shapeOfDraft(draft), names, chosen)}
        </p>
        <PreviewLine preview={preview} />
        {model.problem && <p className="m-0 text-2xs text-severity-warning-ink">{model.problem}</p>}
      </div>
    </Panel>
  )
}
