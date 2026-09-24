import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  createRule,
  deleteRule,
  organizationsQuery,
  type ReviewRule,
  type ReviewRuleEffect,
  rulesQuery,
  updateRule,
} from '@/integrations/studio-api'
import { formatAge } from '@/shared/format-date'
import type { PillTone, SectionDefinition, SectionTable } from '../../../shared/console-model'
import { useConsoleStore } from '../../../use-console-store'
import { REVIEW_RULES_SECTION } from '../values'

const GRID = '1fr 160px 110px 140px 120px'
const COLUMNS = [
  { label: 'Rule' },
  { label: 'Applies to' },
  { label: 'Effect' },
  { label: 'Installation' },
  { label: 'Written', align: 'end' as const },
]
const EFFECT_TONE: Record<ReviewRuleEffect, PillTone> = {
  blocker: 'bad',
  suggestion: 'warn',
  filter: 'neutral',
  tone: 'info',
}
const EFFECT_OPTIONS = [
  { value: 'blocker', label: 'Blocker — a violation blocks the merge' },
  { value: 'suggestion', label: 'Suggestion — raise it, do not block' },
  { value: 'filter', label: 'Filter — never report this' },
  { value: 'tone', label: 'Tone — how findings should read' },
]

/** Rules are the team's: anyone on the installation writes, mutes or deletes them. */
export function useReviewRulesSection(tab: number): SectionDefinition {
  const queryClient = useQueryClient()
  const { data: rules } = useQuery({ ...rulesQuery(), retry: false })
  const { data: orgs } = useQuery({ ...organizationsQuery(), retry: false })

  return useMemo(() => {
    if (!orgs || orgs.length === 0) return { ...REVIEW_RULES_SECTION, sample: true }

    const all = rules ?? []
    const refresh = () => queryClient.invalidateQueries({ queryKey: rulesQuery().queryKey })
    const flash = (message: string) => useConsoleStore.getState().flash(message)
    const run = (work: Promise<unknown>, message: string) =>
      work
        .then(refresh)
        .then(() => flash(message))
        .catch((error: Error) => flash(error.message))
    const active = all.filter((r) => !r.isMuted)
    const visible = tab === 1 ? active : tab === 2 ? all.filter((r) => r.isMuted) : all

    const rowActions = visible.map((rule: ReviewRule) => [
      {
        label: rule.isMuted ? 'Unmute' : 'Mute',
        onSelect: () =>
          run(
            updateRule(rule.id, { isMuted: !rule.isMuted }),
            rule.isMuted ? 'Rule is back on' : 'Rule muted — the reviewer stops reading it',
          ),
      },
      {
        label: 'Delete',
        tone: 'danger' as const,
        onSelect: () => run(deleteRule(rule.id), 'Rule deleted'),
      },
    ])

    const table: SectionTable = {
      grid: GRID,
      columns: COLUMNS,
      rows: visible.map((rule) => [
        {
          kind: 'text' as const,
          text: rule.body,
          strong: !rule.isMuted,
          tone: rule.isMuted ? ('faint' as const) : undefined,
          wrap: true,
        },
        { kind: 'text' as const, text: rule.scope, mono: true, tone: 'muted' as const },
        {
          kind: 'pill' as const,
          text: rule.isMuted ? 'muted' : rule.effect,
          tone: rule.isMuted ? 'neutral' : EFFECT_TONE[rule.effect],
        },
        { kind: 'text' as const, text: rule.organization, mono: true, tone: 'muted' as const },
        {
          kind: 'text' as const,
          text: `${rule.authorName ?? 'someone'} · ${formatAge(rule.createdAt)}`,
          tone: 'muted' as const,
          align: 'end' as const,
        },
      ]),
      rowActions,
      footer:
        all.length === 0
          ? 'No rules yet — the reviewer runs on its defaults until someone writes one'
          : 'Read by the reviewer on every pull request in the installation · changes apply within a minute',
    }

    return {
      title: 'Review rules',
      subtitle: 'Plain-English instructions Whiskers follows on every pull request',
      actions: [
        {
          label: 'Write a rule',
          variant: 'solid',
          form: {
            title: 'Write a review rule',
            description:
              'Say it the way you would tell a new reviewer. It applies to every repository in the installation.',
            submitLabel: 'Save rule',
            fields: [
              {
                name: 'body',
                label: 'Rule',
                kind: 'textarea',
                placeholder: 'Money is integer cents. Flag any float arithmetic on amounts.',
                isRequired: true,
              },
              { name: 'effect', label: 'Effect', kind: 'select', options: EFFECT_OPTIONS },
              {
                name: 'scope',
                label: 'Applies to',
                kind: 'text',
                defaultValue: '**',
                hint: 'A path glob, like src/billing/** — ** means everywhere',
              },
              {
                name: 'installationId',
                label: 'Installation',
                kind: 'select',
                options: orgs.map((org) => ({
                  value: String(org.installationId),
                  label: org.name ?? org.login,
                })),
              },
            ],
            onSubmit: async (values) => {
              await createRule({
                installationId: Number(values.installationId),
                body: values.body ?? '',
                scope: values.scope?.trim() || '**',
                effect: (values.effect ?? 'suggestion') as ReviewRuleEffect,
              })
              await refresh()
              flash('Rule saved — the next review reads it')
              return undefined
            },
          },
        },
      ],
      stats: [
        { label: 'Active', value: String(active.length), note: 'read on every review' },
        {
          label: 'Blockers',
          value: String(active.filter((r) => r.effect === 'blocker').length),
          note: 'raise high severity',
        },
        {
          label: 'Filters',
          value: String(active.filter((r) => r.effect === 'filter').length),
          note: 'never reported',
        },
        { label: 'Muted', value: String(all.length - active.length), note: 'kept, not read' },
      ],
      tabs: ['All', 'Active', 'Muted'],
      table,
    }
  }, [rules, orgs, tab, queryClient])
}
