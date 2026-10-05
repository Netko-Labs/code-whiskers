import { createPortal } from 'react-dom'
import { useConsoleStore } from '../use-console-store'
import type { TopbarActionsProps } from './lib'

/** Renders its children into the top bar's right side; at most one per page. */
export function TopbarActions({ children }: TopbarActionsProps) {
  const slot = useConsoleStore((s) => s.actionsSlot)
  return slot ? createPortal(children, slot) : null
}
