import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { apiKeysQuery, createApiKey, revokeApiKey } from '@/integrations/studio-api'
import { formatAge } from '@/shared/format-date'
import type { SectionDefinition, SectionTable } from '../../../shared/console-model'
import { useConsoleStore } from '../../../use-console-store'

const GRID = '1fr 160px 120px 140px 110px'
const COLUMNS = [
  { label: 'Name' },
  { label: 'Key' },
  { label: 'Status' },
  { label: 'Last used' },
  { label: 'Created', align: 'end' as const },
]

/** Keys read /v1 for scripts and CI. They carry their creator's access and nothing more. */
export function useApiKeysSection(tab: number): SectionDefinition {
  const queryClient = useQueryClient()
  const { data } = useQuery({ ...apiKeysQuery(), retry: false })

  return useMemo(() => {
    const keys = data ?? []
    const refresh = () => queryClient.invalidateQueries({ queryKey: apiKeysQuery().queryKey })
    const live = keys.filter((k) => !k.revokedAt)
    const visible = tab === 1 ? keys.filter((k) => k.revokedAt) : live
    const origin = typeof window === 'undefined' ? '' : window.location.origin

    const table: SectionTable = {
      grid: GRID,
      columns: COLUMNS,
      rows: visible.map((key) => [
        { kind: 'text' as const, text: key.name, strong: true },
        { kind: 'text' as const, text: `${key.prefix}…`, mono: true, tone: 'muted' as const },
        {
          kind: 'pill' as const,
          text: key.revokedAt ? 'revoked' : 'active',
          tone: key.revokedAt ? ('neutral' as const) : ('ok' as const),
        },
        {
          kind: 'text' as const,
          text: key.lastUsedAt ? `${formatAge(key.lastUsedAt)} ago` : 'never',
          tone: 'muted' as const,
        },
        {
          kind: 'text' as const,
          text: `${formatAge(key.createdAt)} ago`,
          tone: 'muted' as const,
          align: 'end' as const,
        },
      ]),
      rowActions: visible.map((key) =>
        key.revokedAt
          ? []
          : [
              {
                label: 'Revoke',
                tone: 'danger' as const,
                onSelect: () => {
                  revokeApiKey(key.id)
                    .then(refresh)
                    .then(() => useConsoleStore.getState().flash(`${key.name} revoked`))
                    .catch((error: Error) => useConsoleStore.getState().flash(error.message))
                },
              },
            ],
      ),
      footer: `curl -H "Authorization: Bearer cw_…" ${origin}/v1/reviews · read-only · revoking takes effect immediately`,
    }

    return {
      title: 'API keys',
      subtitle: 'Read access to /v1 for scripts and CI — shown once, stored only as a hash',
      actions: [
        {
          label: 'Create key',
          variant: 'solid',
          form: {
            title: 'Create an API key',
            description: 'It reads everything you can read. Name it after where it will live.',
            submitLabel: 'Create key',
            fields: [
              {
                name: 'name',
                label: 'Name',
                kind: 'text',
                placeholder: 'release-dashboard CI',
                isRequired: true,
              },
            ],
            onSubmit: async (values) => {
              const { key } = await createApiKey(values.name ?? '')
              await refresh()
              return { message: 'Copy it now — it is not shown again.', reveal: key }
            },
          },
        },
      ],
      stats: [
        { label: 'Active', value: String(live.length), note: 'yours' },
        {
          label: 'Used this week',
          value: String(
            live.filter((k) => k.lastUsedAt && Date.now() - k.lastUsedAt.getTime() < 604_800_000)
              .length,
          ),
          note: 'at least one request',
        },
        {
          label: 'Never used',
          value: String(live.filter((k) => !k.lastUsedAt).length),
          note: 'worth revoking',
        },
        { label: 'Revoked', value: String(keys.length - live.length), note: 'kept for the record' },
      ],
      tabs: ['Active', 'Revoked'],
      table,
    }
  }, [data, tab, queryClient])
}
