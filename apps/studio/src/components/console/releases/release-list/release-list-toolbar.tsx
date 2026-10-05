import { IconServer2, IconStack2 } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import {
  FilterChips,
  FilterMenu,
  Toolbar,
  ToolbarSearch,
  ToolbarSpacer,
} from '@/components/shared/toolbar'
import type { SectionFilters } from '../../shared/console-model'
import { listOf, optionLabel, type ReleaseListToolbarProps, toggled } from './lib'

/** Every facet writes the URL, so a filtered list is shareable and survives a reload. */
export function ReleaseListToolbar({ tab, filters, facets }: ReleaseListToolbarProps) {
  const navigate = useNavigate()
  const set = (patch: Partial<SectionFilters>) =>
    void navigate({
      to: '/console/$section',
      params: { section: 'releases' },
      search: { ...filters, ...patch, tab },
      replace: true,
    })
  const chips = [
    ...listOf(filters.project).map((id) => ({
      key: `project:${id}`,
      label: 'Project',
      value: optionLabel(facets.projects, id),
      onRemove: () => set({ project: toggled(filters.project, id) }),
    })),
    ...listOf(filters.environment).map((name) => ({
      key: `environment:${name}`,
      label: 'Environment',
      value: name,
      onRemove: () => set({ environment: toggled(filters.environment, name) }),
    })),
  ]

  return (
    <Toolbar>
      {facets.projects.length > 1 && (
        <FilterMenu
          label="Project"
          icon={IconStack2}
          options={facets.projects}
          selected={listOf(filters.project)}
          onToggle={(id) => set({ project: toggled(filters.project, id) })}
        />
      )}
      <FilterMenu
        label="Environment"
        icon={IconServer2}
        options={facets.environments}
        selected={listOf(filters.environment)}
        onToggle={(name) => set({ environment: toggled(filters.environment, name) })}
      />
      <FilterChips
        chips={chips}
        onClearAll={() => set({ project: undefined, environment: undefined })}
      />
      <ToolbarSpacer />
      <ToolbarSearch
        value={filters.q ?? ''}
        onValueChange={(q) => set({ q: q || undefined })}
        placeholder="Search versions…"
      />
    </Toolbar>
  )
}
