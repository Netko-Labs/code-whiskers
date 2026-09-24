import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  type AlertKind,
  type AlertRule,
  alertRulesQuery,
  createAlertRule,
  deleteAlertRule,
  integrationsQuery,
  organizationsQuery,
  setAlertRuleMuted,
} from '@/integrations/studio-api'
import { whiskersProjectsQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type { PillTone, SectionDefinition, SectionTable } from '../../../shared/console-model'
import { useConsoleStore } from '../../../use-console-store'
import { textCell as text } from '../utils'
import { ALERT_RULES_SECTION } from '../values'

const KIND_OPTIONS = [
  { value: 'new_issue', label: 'A new issue appears' },
  { value: 'error_rate', label: 'Errors pass a count within a window' },
  { value: 'review_failed', label: 'A review fails' },
  { value: 'blocking_review', label: 'A review blocks a pull request' },
]
const STATE_TONE: Record<AlertRule['state'], PillTone> = {
  armed: 'ok',
  firing: 'bad',
  muted: 'neutral',
}

function describe(rule: AlertRule): string {
  const where = rule.projectId ? ` in project ${rule.projectId}` : ''
  if (rule.kind === 'new_issue') return `new issue${where}`
  if (rule.kind === 'error_rate')
    return `≥ ${rule.threshold} errors in ${rule.windowMinutes}m${where}`
  if (rule.kind === 'review_failed') return 'a review fails'
  return 'a review requests changes'
}

function flash(message: string) {
  useConsoleStore.getState().flash(message)
}

/** Whiskers evaluates these every minute; studio delivers to the installation's webhooks. */
export function useAlertRulesSection(tab: number): SectionDefinition {
  const queryClient = useQueryClient()
  const { data: rules } = useQuery({ ...alertRulesQuery(), retry: false })
  const { data: orgs } = useQuery({ ...organizationsQuery(), retry: false })
  const { data: hooks } = useQuery({ ...integrationsQuery(), retry: false })
  const { data: projects } = useQuery({ ...whiskersProjectsQuery(), retry: false })

  return useMemo(() => {
    if (!orgs || orgs.length === 0) return { ...ALERT_RULES_SECTION, sample: true }

    const all = rules ?? []
    const refresh = () => queryClient.invalidateQueries({ queryKey: alertRulesQuery().queryKey })
    const run = (work: Promise<unknown>, message: string) => {
      work
        .then(refresh)
        .then(() => flash(message))
        .catch((error: Error) => flash(error.message))
    }
    const deliveries = new Map<number, number>()
    for (const hook of hooks ?? []) {
      deliveries.set(hook.installationId, (deliveries.get(hook.installationId) ?? 0) + 1)
    }
    const firing = all.filter((r) => r.state === 'firing')
    const visible = tab === 1 ? firing : tab === 2 ? all.filter((r) => r.state === 'muted') : all

    const table: SectionTable = {
      grid: '1fr 1fr 100px 130px 140px',
      columns: [
        { label: 'Rule' },
        { label: 'Fires when' },
        { label: 'State' },
        { label: 'Delivers to' },
        { label: 'Last fired', align: 'end' },
      ],
      rows: visible.map((rule) => {
        const targets = deliveries.get(rule.installationId) ?? 0
        return [
          text(rule.name, { strong: true, dot: rule.state === 'firing' ? 'critical' : undefined }),
          text(describe(rule), { tone: 'muted' }),
          { kind: 'pill', text: rule.state, tone: STATE_TONE[rule.state] },
          text(targets ? `${targets} webhook${targets === 1 ? '' : 's'}` : 'no webhooks', {
            tone: targets ? 'muted' : 'warn',
          }),
          text(rule.lastFiredAt ? `${formatAge(rule.lastFiredAt)} ago` : 'never', {
            tone: 'muted',
            align: 'end',
          }),
        ]
      }),
      rowActions: visible.map((rule) => [
        {
          label: rule.state === 'muted' ? 'Unmute' : 'Mute',
          onSelect: () =>
            run(
              setAlertRuleMuted(rule.id, rule.state !== 'muted'),
              rule.state === 'muted' ? `${rule.name} is armed` : `${rule.name} muted`,
            ),
        },
        {
          label: 'Delete',
          tone: 'danger',
          onSelect: () => run(deleteAlertRule(rule.id), `${rule.name} deleted`),
        },
      ]),
      footer: (hooks ?? []).length
        ? 'Evaluated every minute by the worker · delivered by studio to every webhook on the installation'
        : 'No webhooks yet — add one under Integrations or alerts have nowhere to go',
    }

    return {
      title: 'Alert rules',
      subtitle: 'Conditions the worker checks every minute, delivered to your webhooks',
      actions: [
        {
          label: 'New alert rule',
          variant: 'solid',
          form: {
            title: 'New alert rule',
            submitLabel: 'Create rule',
            fields: [
              {
                name: 'name',
                label: 'Name',
                kind: 'text',
                placeholder: 'Checkout errors',
                isRequired: true,
              },
              { name: 'kind', label: 'Fires when', kind: 'select', options: KIND_OPTIONS },
              {
                name: 'projectId',
                label: 'Project',
                kind: 'select',
                options: [
                  { value: '', label: 'Any project' },
                  ...(projects ?? []).map((p) => ({ value: p.id, label: p.name })),
                ],
                hint: 'Only used by error rules',
              },
              {
                name: 'threshold',
                label: 'At least',
                kind: 'text',
                defaultValue: '1',
                hint: 'How many issues, errors or reviews it takes',
              },
              { name: 'windowMinutes', label: 'Within minutes', kind: 'text', defaultValue: '5' },
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
              await createAlertRule({
                installationId: Number(values.installationId),
                name: values.name ?? '',
                kind: (values.kind ?? 'new_issue') as AlertKind,
                projectId: values.projectId || null,
                threshold: Number(values.threshold) || 1,
                windowMinutes: Number(values.windowMinutes) || 5,
              })
              await refresh()
              flash('Alert rule armed — the worker picks it up within a minute')
              return undefined
            },
          },
        },
      ],
      stats: [
        {
          label: 'Rules',
          value: String(all.length),
          note: `${all.filter((r) => r.state === 'muted').length} muted`,
        },
        { label: 'Firing', value: String(firing.length), note: 'right now' },
        {
          label: 'Fired today',
          value: String(
            all.filter((r) => r.lastFiredAt && Date.now() - r.lastFiredAt.getTime() < 86_400_000)
              .length,
          ),
          note: 'rules, last 24h',
        },
        { label: 'Webhooks', value: String((hooks ?? []).length), note: 'delivery targets' },
      ],
      tabs: ['All', 'Firing', 'Muted'],
      table,
    }
  }, [rules, orgs, hooks, projects, tab, queryClient])
}
