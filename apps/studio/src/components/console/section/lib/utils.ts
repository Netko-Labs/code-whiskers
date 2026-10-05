import { createSavedQuery } from '@/integrations/studio-api'
import { setWhiskersProjectRepository, type WhiskersProject } from '@/integrations/whiskers'
import type {
  SectionAction,
  SectionCell,
  SectionDefinition,
  SectionFieldOption,
  SectionFilters,
  SectionForm,
  SectionTextCell,
} from '../../shared/console-model'
import type { ConsoleScope } from '../../shared/console-scope'
import { MEMBERS_SECTION } from './values'

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const

export function formatBytes(bytes: number): string {
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${BYTE_UNITS[unit]}`
}

export function formatSeconds(seconds: number | null): string {
  if (seconds === null) return '—'
  if (seconds < 90) return `${Math.round(seconds)}s`
  if (seconds < 5400) return `${Math.round(seconds / 60)}m`
  return `${(seconds / 3600).toFixed(1)}h`
}

export function textCell(
  value: string,
  extra: Partial<Omit<SectionTextCell, 'kind' | 'text'>> = {},
): SectionCell {
  return { kind: 'text', text: value, ...extra }
}

/** "Save view" for any filterable section: the tab and filters as they are right now. */
export function saveViewAction(
  section: 'live-logs' | 'traces' | 'issues',
  tab: number,
  filters: SectionFilters,
  onSaved: () => Promise<unknown>,
): SectionAction {
  return {
    label: 'Save view',
    variant: 'outline',
    form: {
      title: 'Save this view',
      description: 'The tab, search and service filter come back exactly as they are now.',
      submitLabel: 'Save',
      fields: [
        {
          name: 'name',
          label: 'Name',
          kind: 'text',
          placeholder: 'Checkout errors',
          isRequired: true,
        },
      ],
      onSubmit: async (values) => {
        await createSavedQuery({
          name: values.name ?? '',
          section,
          tab,
          query: filters.q ?? null,
          service: filters.service ?? null,
        })
        await onSaved()
        return undefined
      },
    },
  }
}

/** A repository scope with no linked project has no telemetry — say why the table is empty. */
export function unlinkedScopeNote(scope: ConsoleScope): string | null {
  if (!scope.value || scope.projectIds?.length !== 0) return null
  return `No project sends telemetry for ${scope.label} yet — link one under Integrations → Error ingest`
}

const NO_REPOSITORY = ''

export function linkRepositoryForm(
  project: WhiskersProject,
  options: SectionFieldOption[],
  onSaved: (repository: string | null) => Promise<void>,
): SectionForm {
  return {
    title: `Link ${project.name} to a repository`,
    description:
      'Its errors, logs and traces then show up under that repository, next to its reviews.',
    submitLabel: 'Save',
    fields: [
      {
        name: 'repository',
        label: 'Repository',
        kind: 'select',
        options,
        defaultValue: project.repository ?? NO_REPOSITORY,
      },
    ],
    onSubmit: async (values) => {
      const repository = values.repository || null
      await setWhiskersProjectRepository(project.id, repository)
      await onSaved(repository)
      return undefined
    },
  }
}

/** The GitHub App install link is the next step once the instance knows it. */
export function emptyMembers(installUrl: string | undefined): SectionDefinition {
  const empty = MEMBERS_SECTION.empty
  return {
    ...MEMBERS_SECTION,
    empty:
      empty && installUrl
        ? { ...empty, action: { label: 'Install on another account', href: installUrl } }
        : empty,
  }
}
