import type { RefObject } from 'react'

export type QueryInputState = {
  draft: string
  inputRef: RefObject<HTMLInputElement | null>
  setDraft: (draft: string) => void
  submit: () => void
  clear: () => void
}

export type LogsQueryInputProps = {
  initial: string
  /** Applies the text and returns what stays in the field (the free-text part). */
  onSubmit: (text: string) => string
}
