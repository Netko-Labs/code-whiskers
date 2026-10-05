import { useNavigate } from '@tanstack/react-router'
import type { SectionFilters } from '../../shared/console-model'
import { IssueFilterMenu } from './issue-filter-menu'
import { IssueFilterToggle } from './issue-filter-toggle'
import { IssueSortMenu } from './issue-sort-menu'
import { type IssueFilterBarProps, useFilterOptions } from './lib'

/** Every chip writes the URL, so a filtered list is shareable and survives a reload. */
export function IssueFilterBar({ section, tab, filters }: IssueFilterBarProps) {
  const navigate = useNavigate()
  const options = useFilterOptions()

  const set = (patch: Partial<SectionFilters>) =>
    void navigate({
      to: '/console/$section',
      params: { section },
      search: { ...filters, ...patch, tab },
      replace: true,
    })

  return (
    <div className="flex flex-wrap items-center gap-2 pb-2.5">
      <IssueFilterMenu
        label="Environment"
        value={filters.environment}
        options={options.environments}
        onPick={(environment) => set({ environment })}
      />
      <IssueFilterMenu
        label="Release"
        value={filters.release}
        options={options.releases}
        onPick={(release) => set({ release })}
      />
      <IssueFilterToggle
        label="Assigned to me"
        isOn={filters.mine === '1'}
        onToggle={() => set({ mine: filters.mine ? undefined : '1' })}
      />
      <IssueSortMenu value={filters.sort ?? 'last_seen'} onPick={(sort) => set({ sort })} />
    </div>
  )
}
