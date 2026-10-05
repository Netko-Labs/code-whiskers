import { Link } from '@tanstack/react-router'
import { DataListSkeleton } from '@/components/shared/data-list'
import { Panel } from '@/components/shared/page'
import { FiringList } from '../shared/firing-list'
import type { RuleHistoryProps } from './lib'

const SHOWN = 8

export function RuleHistory({ firings }: RuleHistoryProps) {
  return (
    <Panel
      title="Recent firings"
      isFlush
      actions={
        <Link
          to="/console/alerts/activity"
          className="text-2xs text-muted-foreground hover:text-foreground"
        >
          All activity
        </Link>
      }
    >
      {!firings ? (
        <DataListSkeleton rows={3} density="compact" />
      ) : firings.length === 0 ? (
        <p className="m-0 px-4 py-4 text-2xs text-muted-foreground">
          Nothing yet. Firings land here with where each one went.
        </p>
      ) : (
        <FiringList firings={firings.slice(0, SHOWN)} />
      )}
    </Panel>
  )
}
