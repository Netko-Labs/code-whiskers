import { type RefObject, useEffect, useRef } from 'react'

/** j / k can move the selection while focus is elsewhere; the selected row stays in view. */
export function useScrollSelected(selectedId: string): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!selectedId) return
    ref.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [selectedId])
  return ref
}
