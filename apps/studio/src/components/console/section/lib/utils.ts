import { createSavedQuery } from '@/integrations/studio-api'
import { setWhiskersProjectRepository, type WhiskersProject } from '@/integrations/whiskers'
import type {
  SectionAction,
  SectionCell,
  SectionFieldOption,
  SectionFilters,
  SectionForm,
  SectionTextCell,
} from '../../shared/console-model'
import type { ConsoleScope } from '../../shared/console-scope'
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
