import { IconX } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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
    <div className="ml-3 flex items-center gap-1.5">
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-7 w-[240px] rounded-lg border border-border bg-transparent px-2.5 text-xs outline-none placeholder:text-faint focus-visible:border-ring"
      />
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
          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 font-mono text-[11px]"
        >
          service: {filters.service}
          <IconX className="size-3" stroke={2} />
        </button>
      )}
    </div>
  )
}
