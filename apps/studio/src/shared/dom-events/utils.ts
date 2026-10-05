import type { ScrollTarget } from './types'

export function scrollIntoView(target: ScrollTarget, options?: ScrollIntoViewOptions) {
  target.current?.scrollIntoView(options)
}

/** Single-letter shortcuts never fire while the user is typing somewhere. */
export function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}
