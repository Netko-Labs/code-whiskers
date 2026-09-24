import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  createIntegration,
  deleteIntegration,
  type IntegrationKind,
  instanceQuery,
  integrationsQuery,
  organizationsQuery,
  repositoriesQuery,
  testIntegration,
} from '@/integrations/studio-api'
import { createWhiskersProject, whiskersProjectsQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type { SectionAction, SectionDefinition, SectionTable } from '../../../shared/console-model'
import { useConsoleStore } from '../../../use-console-store'
import { dsnFor, linkRepositoryForm, repositoryOptionsOf, textCell as text } from '../utils'

const TABS = ['Webhooks', 'Error ingest', 'GitHub App'] as const
const KIND_OPTIONS = [
  { value: 'slack', label: 'Slack incoming webhook' },
  { value: 'discord', label: 'Discord webhook' },
  { value: 'webhook', label: 'Any HTTPS endpoint (JSON)' },
]

function flash(message: string) {
  useConsoleStore.getState().flash(message)
}

/** Everything this instance talks to: where alerts go, what sends errors, the GitHub App. */
export function useIntegrationsSection(tab: number): SectionDefinition {
  const queryClient = useQueryClient()
  const { data: hooks } = useQuery({ ...integrationsQuery(), retry: false })
  const { data: projects } = useQuery({ ...whiskersProjectsQuery(), retry: false })
  const { data: orgs } = useQuery({ ...organizationsQuery(), retry: false })
  const { data: repos } = useQuery({ ...repositoriesQuery(), retry: false })
  const { data: instance } = useQuery({ ...instanceQuery(), retry: false })

  return useMemo(() => {
    const installations = orgs ?? []
    const webhooks = hooks ?? []
    const sources = projects ?? []
    const origin = typeof window === 'undefined' ? 'https://example.com' : window.location.origin
    const refreshHooks = () =>
      queryClient.invalidateQueries({ queryKey: integrationsQuery().queryKey })
    const refreshProjects = () =>
      queryClient.invalidateQueries({ queryKey: whiskersProjectsQuery().queryKey })
    const repositoryOptions = repositoryOptionsOf(repos ?? [])

    const webhookTable: SectionTable = {
      grid: '1fr 110px 200px 140px 170px',
      columns: [
        { label: 'Name' },
        { label: 'Kind' },
        { label: 'Delivers to' },
        { label: 'Installation' },
        { label: 'Last delivery', align: 'end' },
      ],
      rows: webhooks.map((hook) => [
        text(hook.name, { strong: true }),
        { kind: 'pill', text: hook.kind, tone: 'neutral' },
        text(hook.urlHost, { mono: true, tone: 'muted' }),
        text(hook.organization, { mono: true, tone: 'muted' }),
        hook.lastError
          ? text(hook.lastError, { tone: 'bad', align: 'end' })
          : text(hook.lastDeliveredAt ? `${formatAge(hook.lastDeliveredAt)} ago` : 'never', {
              tone: 'muted',
              align: 'end',
            }),
      ]),
      rowActions: webhooks.map((hook) => [
        {
          label: 'Send test',
          onSelect: () => {
            testIntegration(hook.id)
              .then((result) => {
                flash(
                  result.delivered
                    ? `Test delivered to ${hook.name}`
                    : `${hook.name} did not accept it`,
                )
                return refreshHooks()
              })
              .catch((error: Error) => flash(error.message))
          },
        },
        {
          label: 'Remove',
          tone: 'danger',
          onSelect: () => {
            deleteIntegration(hook.id)
              .then(refreshHooks)
              .then(() => flash(`${hook.name} removed`))
              .catch((error: Error) => flash(error.message))
          },
        },
      ]),
      footer: 'Alert rules deliver here · the URL is encrypted in studio and never sent back',
    }

    const ingestTable: SectionTable = {
      grid: '160px 190px 1fr 70px 120px',
      columns: [
        { label: 'Project' },
        { label: 'Repository' },
        { label: 'DSN' },
        { label: 'Issues' },
        { label: 'Last event', align: 'end' },
      ],
      rows: sources.map((project) => [
        text(project.name, { strong: true }),
        project.repository
          ? text(project.repository, { mono: true })
          : { kind: 'pill', text: 'not linked', tone: 'warn' },
        text(dsnFor(origin, project), { mono: true, tone: 'muted' }),
        text(String(project.issues), { mono: true }),
        text(project.lastEventAt ? `${formatAge(project.lastEventAt)} ago` : 'nothing yet', {
          tone: project.lastEventAt ? 'muted' : 'warn',
          align: 'end',
        }),
      ]),
      rowActions: sources.map((project) => [
        {
          label: project.repository ? 'Change repository' : 'Link repository',
          form: linkRepositoryForm(project, repositoryOptions, async (repository) => {
            await refreshProjects()
            flash(repository ? `${project.name} → ${repository}` : `${project.name} unlinked`)
          }),
        },
        {
          label: 'Copy DSN',
          onSelect: () => {
            void navigator.clipboard.writeText(dsnFor(origin, project))
            flash(`DSN for ${project.name} copied`)
          },
        },
      ]),
      footer: 'Any Sentry SDK works — pass the DSN to Sentry.init and errors land in Issues',
    }

    const repoCount = new Map<number, number>()
    for (const repo of repos ?? []) {
      repoCount.set(repo.installationId, (repoCount.get(repo.installationId) ?? 0) + 1)
    }
    const githubTable: SectionTable = {
      grid: '1fr 140px 130px 140px',
      columns: [
        { label: 'Installation' },
        { label: 'Type' },
        { label: 'Repositories' },
        { label: 'Synced', align: 'end' },
      ],
      rows: installations.map((org) => [
        text(org.name ?? org.login, { strong: true }),
        text(org.accountType, { tone: 'muted' }),
        text(String(repoCount.get(org.installationId) ?? 0), { mono: true }),
        text(`${formatAge(org.syncedAt)} ago`, { tone: 'muted', align: 'end' }),
      ]),
      rowLinks: installations.map((org) => ({
        kind: 'external' as const,
        href:
          org.accountType === 'Organization'
            ? `https://github.com/organizations/${org.login}/settings/installations`
            : 'https://github.com/settings/installations',
      })),
      footer: `Reviews run through ${instance?.githubApp.slug ?? 'the GitHub App'} · access follows each installation`,
    }

    const actions: SectionAction[] = [
      {
        label: 'Create project',
        variant: 'outline',
        form: {
          title: 'Create an error-ingest project',
          description: 'One per app or service that sends errors. You get a Sentry-compatible DSN.',
          submitLabel: 'Create project',
          fields: [
            {
              name: 'name',
              label: 'Name',
              kind: 'text',
              placeholder: 'web-frontend',
              isRequired: true,
            },
            {
              name: 'repository',
              label: 'Repository',
              kind: 'select',
              options: repositoryOptions,
              hint: 'Errors, logs and traces from this project show up under this repository.',
            },
          ],
          onSubmit: async (values) => {
            const project = await createWhiskersProject(
              values.name ?? '',
              values.repository || null,
            )
            await refreshProjects()
            return {
              message: 'Pass this to Sentry.init({ dsn }) in the app that should report errors.',
              reveal: dsnFor(origin, project),
            }
          },
        },
      },
      {
        label: 'Add webhook',
        variant: 'solid',
        form: {
          title: 'Add a webhook',
          description: 'Alerts post here. Slack and Discord get their own message format.',
          submitLabel: 'Add webhook',
          fields: [
            {
              name: 'name',
              label: 'Name',
              kind: 'text',
              placeholder: '#oncall-platform',
              isRequired: true,
            },
            { name: 'kind', label: 'Kind', kind: 'select', options: KIND_OPTIONS },
            {
              name: 'url',
              label: 'Webhook URL',
              kind: 'text',
              placeholder: 'https://hooks.slack.com/services/…',
              isRequired: true,
            },
            {
              name: 'installationId',
              label: 'Installation',
              kind: 'select',
              options: installations.map((org) => ({
                value: String(org.installationId),
                label: org.name ?? org.login,
              })),
            },
          ],
          onSubmit: async (values) => {
            await createIntegration({
              installationId: Number(values.installationId),
              kind: (values.kind ?? 'webhook') as IntegrationKind,
              name: values.name ?? '',
              url: values.url ?? '',
            })
            await refreshHooks()
            flash('Webhook added — send it a test from the list')
            return undefined
          },
        },
      },
    ]

    return {
      title: 'Integrations',
      subtitle: 'Where alerts go, what sends errors in, and the GitHub App reviews run through',
      actions,
      stats: [
        {
          label: 'Webhooks',
          value: String(webhooks.length),
          note: `${webhooks.filter((h) => h.lastError).length} failing`,
        },
        { label: 'Projects', value: String(sources.length), note: 'sending errors' },
        {
          label: 'Silent projects',
          value: String(sources.filter((p) => !p.lastEventAt).length),
          note: 'no event yet',
        },
        { label: 'Installations', value: String(installations.length), note: 'GitHub App' },
      ],
      tabs: [...TABS],
      table: tab === 1 ? ingestTable : tab === 2 ? githubTable : webhookTable,
    }
  }, [hooks, projects, orgs, repos, instance, tab, queryClient])
}
