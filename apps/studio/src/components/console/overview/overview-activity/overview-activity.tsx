import { Skeleton } from '@code-whiskers/ui/components/skeleton'
import { useState } from 'react'
import { Panel } from '@/components/shared/page'
import { LiveDot } from '@/components/shared/status'
import { useActivityFeed } from '../lib'
import { FeedEntry } from './feed-entry'

/** Refetched over realtime; anything newer than the page highlights once as it arrives. */
export function OverviewActivity() {
  const { entries, isLoading } = useActivityFeed()
  const [openedAt] = useState(() => Date.now())

  return (
    <Panel title="Activity" actions={<LiveDot />} isFlush>
      {isLoading ? (
        <div aria-hidden className="flex flex-col gap-3 p-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-[26px] rounded-full" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="m-0 px-4 py-10 text-center text-muted-foreground text-ui">
          Reviews, resolves and regressions show up here as they happen.
        </p>
      ) : (
        <ol className="stagger m-0 flex max-h-[268px] list-none flex-col overflow-y-auto p-2">
          {entries.map((entry) => (
            <FeedEntry key={entry.id} entry={entry} isFresh={entry.at.getTime() > openedAt} />
          ))}
        </ol>
      )}
    </Panel>
  )
}
