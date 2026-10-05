import { DataList } from '@/components/shared/data-list'
import { FiringRow } from './firing-row'
import type { FiringListProps } from './lib'

export function FiringList({ firings, isRuleShown = false }: FiringListProps) {
  return (
    <DataList label="Alert activity" isDivided>
      {firings.map((firing) => (
        <FiringRow key={firing.id} firing={firing} isRuleShown={isRuleShown} />
      ))}
    </DataList>
  )
}
