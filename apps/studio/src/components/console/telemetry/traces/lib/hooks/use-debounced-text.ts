import { useEffect, useRef, useState } from 'react'
import { SEARCH_DEBOUNCE_MS } from '../values'

/** A field that types freely and commits after a pause; outside changes reset it. */
export function useDebouncedText(value: string, commit: (next: string) => void) {
  const [draft, setDraft] = useState(value)
  const commitRef = useRef(commit)
  commitRef.current = commit

  useEffect(() => setDraft(value), [value])
  useEffect(() => {
    if (draft === value) return
    const timer = setTimeout(() => commitRef.current(draft), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [draft, value])

  return [draft, setDraft] as const
}
