import { createSavedQuery } from '@/integrations/studio-api'
import {
  setWhiskersProjectRepository,
  type WhiskersProject,
  type WhiskersReview,
} from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import { formatDiff, latestReviewPerPullRequest } from '../../shared/console-data'
import type {
  ConsoleSeverity,
  PillTone,
  SectionAction,
  SectionCell,
  SectionFieldOption,
  SectionFilters,
  SectionForm,
  SectionTextCell,
} from '../../shared/console-model'
import type { ConsoleScope } from '../../shared/console-scope'

export type PullRequestRow = {
  review: WhiskersReview
  slug: string
}

/** One row per pull request: the newest review wins, older pushes fall away. */
export function latestPerPullRequest(reviews: WhiskersReview[]): PullRequestRow[] {
  return latestReviewPerPullRequest(reviews).map((review) => ({
    review,
    slug: `${review.owner}/${review.repo}`,
  }))
}

export function verdictCell(review: WhiskersReview): SectionCell {
  if (review.status === 'failed') return { kind: 'pill', text: 'failed', tone: 'bad' }
  if (review.status !== 'completed') return { kind: 'pill', text: review.status, tone: 'neutral' }
  if (review.findingCount === 0) return { kind: 'pill', text: 'No findings', tone: 'ok' }

  const tone: PillTone = review.verdict === 'request_changes' ? 'bad' : 'warn'
  const label = review.verdict === 'request_changes' ? 'blocker' : 'suggestion'
  const plural = review.findingCount === 1 ? '' : 's'
  return { kind: 'pill', text: `${review.findingCount} ${label}${plural}`, tone }
}

export function reviewSeverityDot(review: WhiskersReview) {
  if (review.status === 'failed') return 'critical' as const
  if (review.status !== 'completed') return 'info' as const
  if (review.findingCount === 0) return 'ok' as const
  return review.verdict === 'request_changes' ? ('critical' as const) : ('warning' as const)
}

export function reviewAge(review: WhiskersReview): string {
  return formatAge(review.completedAt ?? review.createdAt)
}

export function reviewDiff(review: WhiskersReview): string {
  return formatDiff(review)
}

/** Median wall-clock time from review start to completion, as a compact label. */
export function medianReviewDuration(reviews: WhiskersReview[]): string {
  const durations = reviews
    .filter((r) => r.completedAt !== null)
    .map((r) => (r.completedAt as Date).getTime() - r.createdAt.getTime())
    .filter((ms) => ms > 0)
    .sort((a, b) => a - b)
  if (durations.length === 0) return '—'

  const middle = durations[Math.floor(durations.length / 2)] ?? 0
  const seconds = Math.round(middle / 1000)
  return seconds < 90 ? `${seconds}s` : `${Math.round(seconds / 60)}m`
}

export function issueDot(level: string): ConsoleSeverity {
  if (level === 'fatal' || level === 'error') return 'critical'
  if (level === 'warning') return 'warning'
  return 'info'
}

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

/** Sentry's DSN shape: the public key as the username, the project id as the path. */
export function dsnFor(origin: string, project: { id: string; publicKey: string }): string {
  const url = new URL(origin)
  return `${url.protocol}//${project.publicKey}@${url.host}/${project.id}`
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

export function repositoryOptionsOf(
  repos: { owner: string; name: string }[],
): SectionFieldOption[] {
  return [
    { value: NO_REPOSITORY, label: 'No repository' },
    ...repos
      .map((repo) => `${repo.owner}/${repo.name}`)
      .sort((a, b) => a.localeCompare(b))
      .map((slug) => ({ value: slug, label: slug })),
  ]
}

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
