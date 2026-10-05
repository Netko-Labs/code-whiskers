import { Button, buttonVariants } from '@code-whiskers/ui/components/button'
import { IconPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { DataList, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { AddDestinationDialog } from './add-destination-dialog'
import { DestinationRow } from './destination-row'
import { useDestinations } from './lib'

export function DestinationList() {
  const model = useDestinations()
  const [isAdding, setAdding] = useState(false)
  const dialog = (
    <AddDestinationDialog
      installations={model.installations}
      isOpen={isAdding}
      onOpenChange={setAdding}
    />
  )
  const addButton = (
    <Button size="sm" onClick={() => setAdding(true)}>
      <IconPlus stroke={1.75} />
      Add destination
    </Button>
  )

  if (model.isLoading) return <DataListSkeleton rows={3} />
  if (model.isError) return <ErrorState onRetry={model.retry} />
  if (model.installations.length === 0) {
    return (
      <EmptyState
        title="Connect GitHub first"
        description="Destinations belong to an installation. Install the GitHub App, then come back."
        action={
          <Link
            to="/console/$section"
            params={{ section: 'integrations' }}
            search={{ tab: 2 }}
            className={buttonVariants({ size: 'sm' })}
          >
            Connect GitHub
          </Link>
        }
      />
    )
  }
  if (model.destinations.length === 0) {
    return (
      <>
        <EmptyState
          title="No destinations yet"
          description="Slack, Discord or any HTTPS endpoint. Rules deliver here; the default rule waits for the first one."
          action={addButton}
        />
        {dialog}
      </>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-4 border-border border-b px-gutter py-2.5">
        <p className="m-0 text-2xs text-muted-foreground">
          Send a test before you rely on one · a failing destination shows its last error
        </p>
        {addButton}
      </div>
      <DataList label="Destinations" isDivided>
        {model.destinations.map((destination) => (
          <DestinationRow
            key={destination.id}
            destination={destination}
            isTesting={model.testingId === destination.id}
            isOrgShown={model.installations.length > 1}
            onTest={() => model.test(destination)}
            onRemove={() => model.remove(destination)}
          />
        ))}
      </DataList>
      {dialog}
    </div>
  )
}
