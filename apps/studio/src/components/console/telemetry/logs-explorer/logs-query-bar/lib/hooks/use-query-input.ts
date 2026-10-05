import { useCallback, useRef, useState } from 'react'
import { isTyping, useDocumentKeydown } from '@/shared/dom-events'
import type { QueryInputState } from '../types'

const FOCUS_KEY = '/'

/** The draft is local until Enter; `/` focuses it from anywhere on the page. */
export function useQueryInput(
  initial: string,
  onSubmit: (text: string) => string,
): QueryInputState {
  const [draft, setDraft] = useState(initial)
  const inputRef = useRef<HTMLInputElement>(null)
  const focus = useCallback((event: KeyboardEvent) => {
    if (event.key !== FOCUS_KEY || isTyping(event.target) || event.metaKey || event.ctrlKey) return
    event.preventDefault()
    inputRef.current?.focus()
  }, [])
  useDocumentKeydown(focus)

  return {
    draft,
    inputRef,
    setDraft,
    submit: () => setDraft(onSubmit(draft)),
    clear: () => setDraft(onSubmit('')),
  }
}
