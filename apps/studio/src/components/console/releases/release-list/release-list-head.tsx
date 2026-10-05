import { cn } from '@code-whiskers/ui/lib/utils'
import { DataListHeader } from '@/components/shared/data-list'
import { COLUMN } from './lib'

/** Column labels; widths come from the same tokens the rows use. */
export function ReleaseListHead() {
  return (
    <DataListHeader>
      <span className="w-4 shrink-0" />
      <span className="flex-1">Release</span>
      <span className={cn('hidden lg:block', COLUMN.envs)}>Environments</span>
      <span className={COLUMN.newIssues}>New issues</span>
      <span className={cn('hidden md:block', COLUMN.events)}>Events, 14d</span>
      <span className={cn('hidden md:block', COLUMN.commits)}>Commits</span>
      <span className={cn('hidden xl:block', COLUMN.deployed)}>Last deploy</span>
      <span className={COLUMN.age}>Age</span>
    </DataListHeader>
  )
}
