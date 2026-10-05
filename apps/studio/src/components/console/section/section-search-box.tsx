import { IconX } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ToolbarSearch } from '@/components/shared/toolbar'
import type { SectionSearchBoxProps } from './lib'

const DEBOUNCE_MS = 300

/** The URL owns the query, so a search is shareable and a saved query can reopen it. */
export function SectionSearchBox({ section, tab, filters, placeholder }: SectionSearchBoxProps) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(filters.q ?? '')

  useEffect(() => {
    const next = draft.trim() || undefined
    if (next === filters.q) return
    const timer = setTimeout(() => {
      void navigate({
        to: '/console/$section',
        params: { section },
        search: { ...filters, tab, q: next },
        replace: true,
      })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [draft, filters, navigate, section, tab])

  return (
    <div className="ml-auto flex items-center gap-1.5 py-2.5">
      <ToolbarSearch value={draft} onValueChange={setDraft} placeholder={placeholder} />
      {filters.service && (
        <button
          type="button"
          onClick={() =>
            void navigate({
              to: '/console/$section',
              params: { section },
              search: { ...filters, tab, service: undefined },
            })
          }
          className="focus-ring flex h-7 animate-enter-scale items-center gap-1 rounded-md border border-border px-2 font-mono text-2xs transition-colors hover:bg-surface-hover"
        >
          service: {filters.service}
          <IconX className="size-3" stroke={2} />
        </button>
      )}
    </div>
  )
}
