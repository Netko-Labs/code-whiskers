import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { studioStorageQuery } from '@/integrations/studio-api'
import { whiskersInstanceQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type { SectionDefinition, SectionTable } from '../../../shared/console-model'
import type { StoreRow } from '../types'
import { formatBytes, formatSeconds, textCell as text } from '../utils'
import { INSTANCE_SECTION } from '../values'
import { useSetupSteps } from './use-setup-steps'

const TABS = ['Storage', 'Activity', 'Setup', 'Reviewer'] as const
const STORAGE_GRID = '1fr 110px 1fr 120px 110px'
const STORAGE_COLUMNS = [
  { label: 'Table' },
  { label: 'Database' },
  { label: 'On disk' },
  { label: 'Rows' },
  { label: 'Oldest', align: 'end' as const },
]
const ACTIVITY_GRID = '1fr 160px 160px'
const ACTIVITY_COLUMNS = [
  { label: 'Measure' },
  { label: 'Last 24h' },
  { label: 'Last 7 days', align: 'end' as const },
]

/** Both databases, one picture: whiskers answers for its tables, studio for its own. */
export function useInstanceSection(tab: number): SectionDefinition {
  const { data: worker } = useQuery({ ...whiskersInstanceQuery(), retry: false })
  const { data: studio } = useQuery({ ...studioStorageQuery(), retry: false })
  const steps = useSetupSteps()

  return useMemo(() => {
    if (!worker && !studio) return { ...INSTANCE_SECTION, sample: true }

    const stores: StoreRow[] = [
      ...(worker?.stores ?? []).map((s) => ({
        table: s.table,
        database: 'whiskers',
        bytes: s.bytes,
        rows: `${s.isEstimate ? '≈' : ''}${s.rows.toLocaleString()}`,
        oldest: s.oldest,
      })),
      ...(studio?.stores ?? []).map((s) => ({
        table: s.table,
        database: 'studio',
        bytes: s.bytes,
        rows: s.rows.toLocaleString(),
        oldest: s.oldest,
      })),
    ].sort((a, b) => b.bytes - a.bytes)
    const largest = Math.max(1, ...stores.map((s) => s.bytes))
    const activity = worker?.activity

    const storage: SectionTable = {
      grid: STORAGE_GRID,
      columns: STORAGE_COLUMNS,
      rows: stores.map((store) => [
        text(store.table, { mono: true, strong: true }),
        text(store.database, { tone: 'muted' }),
        {
          kind: 'bar',
          percent: Math.max(1, Math.round((store.bytes / largest) * 100)),
          tone: 'ok',
          note: formatBytes(store.bytes),
        },
        text(store.rows, { mono: true }),
        text(store.oldest ? `${formatAge(store.oldest)}` : '—', { tone: 'muted', align: 'end' }),
      ]),
      footer: `Logs and spans go after ${worker?.telemetryRetentionDays ?? 7} days, error events after ${worker?.errorEventRetentionDays ?? 90} · reviews and issues are kept`,
    }
    const throughput: SectionTable = {
      grid: ACTIVITY_GRID,
      columns: ACTIVITY_COLUMNS,
      rows: activity
        ? [
            [
              text('Reviews', { strong: true }),
              text(String(activity.reviews24h), { mono: true }),
              text(String(activity.reviews7d), { mono: true, align: 'end' }),
            ],
            [
              text('Failed reviews', { strong: true }),
              text('—', { tone: 'muted' }),
              text(String(activity.failed7d), {
                mono: true,
                align: 'end',
                tone: activity.failed7d > 0 ? 'bad' : 'muted',
              }),
            ],
            [
              text('Error events', { strong: true }),
              text(activity.events24h.toLocaleString(), { mono: true }),
              text(activity.events7d.toLocaleString(), { mono: true, align: 'end' }),
            ],
            [
              text('Median review time', { strong: true }),
              text('—', { tone: 'muted' }),
              text(formatSeconds(activity.medianReviewSeconds), { mono: true, align: 'end' }),
            ],
          ]
        : [],
      footer: 'Counted from the worker database on each load',
    }
    const setup: SectionTable = {
      grid: '260px 90px 1fr',
      columns: [{ label: 'Step' }, { label: 'Status' }, { label: 'How' }],
      rows: steps.map((step) => [
        text(step.step, { strong: !step.isDone, tone: step.isDone ? 'muted' : undefined }),
        { kind: 'pill', text: step.isDone ? 'done' : 'to do', tone: step.isDone ? 'ok' : 'warn' },
        text(step.how, { tone: 'muted' }),
      ]),
      rowLinks: steps.map((step) => step.link),
      footer: `${steps.filter((s) => s.isDone).length} of ${steps.length} done · each row opens where it is done`,
    }
    const meter = worker?.reviewer
    const per = (value: number) =>
      meter?.meteredReviews7d ? Math.round(value / meter.meteredReviews7d).toLocaleString() : '—'
    const reviewer: SectionTable = {
      grid: '1fr 180px 180px',
      columns: [
        { label: 'Tokens' },
        { label: 'Last 7 days' },
        { label: 'Per review', align: 'end' },
      ],
      rows: meter
        ? [
            [
              text('Input', { strong: true }),
              text(meter.inputTokens7d.toLocaleString(), { mono: true }),
              text(per(meter.inputTokens7d), { mono: true, align: 'end' }),
            ],
            [
              text('Output', { strong: true }),
              text(meter.outputTokens7d.toLocaleString(), { mono: true }),
              text(per(meter.outputTokens7d), { mono: true, align: 'end' }),
            ],
            [
              text('of which reasoning', { tone: 'muted' }),
              text(meter.reasoningTokens7d.toLocaleString(), { mono: true, tone: 'muted' }),
              text(per(meter.reasoningTokens7d), { mono: true, tone: 'muted', align: 'end' }),
            ],
          ]
        : [],
      footer: `${meter?.model ?? 'REVIEW_MODEL'} · ${meter?.meteredReviews7d ?? 0} reviews measured this week · counted across chunks, retries and splits`,
    }
    const total = (worker?.databaseBytes ?? 0) + (studio?.databaseBytes ?? 0)

    return {
      title: 'Instance',
      subtitle: 'What this deployment is holding, and whether the worker is keeping up',
      actions: [],
      stats: [
        {
          label: 'Databases',
          value: formatBytes(total),
          note: `whiskers ${formatBytes(worker?.databaseBytes ?? 0)} · studio ${formatBytes(studio?.databaseBytes ?? 0)}`,
        },
        { label: 'Reviews', value: String(activity?.reviews7d ?? 0), note: 'last 7 days' },
        {
          label: 'Error events',
          value: (activity?.events24h ?? 0).toLocaleString(),
          note: 'last 24h',
        },
        {
          label: 'In flight',
          value: String(activity?.inFlight ?? 0),
          note: activity?.inFlight ? 'reviews running' : 'worker idle',
        },
      ],
      tabs: [...TABS],
      table: tab === 3 ? reviewer : tab === 2 ? setup : tab === 1 ? throughput : storage,
    }
  }, [worker, studio, steps, tab])
}
