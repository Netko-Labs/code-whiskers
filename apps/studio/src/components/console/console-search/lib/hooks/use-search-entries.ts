import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { NAV_GROUPS, useConsoleItems } from '../../../shared/console-data'
import { useConsoleStore } from '../../../use-console-store'
import type { SearchEntry } from '../types'

/** Every triage item and every section, as one list the palette filters by text. */
export function useSearchEntries(): SearchEntry[] {
  const { items } = useConsoleItems()
  const navigate = useNavigate()

  return useMemo(() => {
    const close = () => useConsoleStore.getState().setSearchOpen(false)
    const itemEntries = items.map((item) => ({
      id: `item:${item.id}`,
      group: 'Triage',
      label: `${item.handle} ${item.title}`,
      hint: item.subtitle,
      onSelect: () => {
        close()
        navigate({
          to: '/console/triage/$bucket',
          params: { bucket: 'inbox' },
          search: { sel: item.id },
        })
      },
    }))
    const sectionEntries = NAV_GROUPS.flatMap((group) =>
      group.items.map((nav) => ({
        id: `nav:${group.label}:${nav.label}`,
        group: group.label,
        label: nav.label,
        hint: '',
        onSelect: () => {
          close()
          navigate({ to: nav.to, params: nav.params })
        },
      })),
    )
    return [...sectionEntries, ...itemEntries]
  }, [items, navigate])
}
