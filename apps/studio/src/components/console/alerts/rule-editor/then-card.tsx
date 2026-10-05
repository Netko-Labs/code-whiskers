import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Switch } from '@code-whiskers/ui/components/switch'
import { IconSend } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { INTERVAL_OPTIONS, subjectOf } from '../shared/rule-copy'
import { Segmented } from '../shared/segmented'
import { DestinationPick } from './destination-pick'
import { EditorCard } from './editor-card'
import { type CardProps, useDestinationTest } from './lib'

export function ThenCard({ model }: CardProps) {
  const { draft, dispatch, destinations } = model
  const test = useDestinationTest()
  const subject = subjectOf(draft.triggers)
  const isThrottled =
    subject !== 'review' && !draft.triggers.every((trigger) => trigger === 'new_issue')

  return (
    <EditorCard
      step="Then"
      title="notify"
      description="Each destination gets one message per alert, with a link to the exact issue."
      icon={<IconSend stroke={1.75} />}
    >
      {destinations.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border border-dashed px-3 py-3">
          <span className="text-muted-foreground text-ui">
            No destinations on this installation. The rule saves muted until one exists.
          </span>
          <Link
            to="/console/alerts/destinations"
            className={buttonVariants({ size: 'sm', variant: 'outline' })}
          >
            Add a destination
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between gap-3 text-ui">
            <span className="flex flex-col">
              <span className="font-medium text-foreground">Every destination</span>
              <span className="text-2xs text-muted-foreground">
                Including ones added later to this installation
              </span>
            </span>
            <Switch
              checked={draft.notifyAll}
              onCheckedChange={(notifyAll) => dispatch({ kind: 'set', patch: { notifyAll } })}
            />
          </label>
          <div className="flex flex-col divide-y divide-rule-soft rounded-lg border border-border">
            {destinations.map((destination) => (
              <DestinationPick
                key={destination.id}
                destination={destination}
                isPickable={!draft.notifyAll}
                isChosen={draft.notifyAll || draft.destinationIds.includes(destination.id)}
                isTesting={test.testingId === destination.id}
                onToggle={() =>
                  dispatch({ kind: 'toggle-destination', destinationId: destination.id })
                }
                onTest={() => test.send(destination)}
              />
            ))}
          </div>
        </div>
      )}
      {isThrottled && (
        <div className="flex flex-wrap items-center gap-3 text-ui">
          <span className="text-muted-foreground">At most once per {subject} every</span>
          <Segmented
            label="Action interval"
            value={draft.actionIntervalMinutes}
            onChange={(actionIntervalMinutes) =>
              dispatch({ kind: 'set', patch: { actionIntervalMinutes } })
            }
            options={INTERVAL_OPTIONS}
          />
        </div>
      )}
    </EditorCard>
  )
}
