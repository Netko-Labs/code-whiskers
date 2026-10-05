import { useEffect } from 'react'
import { TOAST_DURATION_MS } from '../lib'
import { useConsoleStore } from '../use-console-store'

/** Toasts sit on a dark pane in both themes; they arrive, they never bounce. */
export function ConsoleToast() {
  const toast = useConsoleStore((s) => s.toast)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => useConsoleStore.getState().clearToast(), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast])

  if (!toast) return null

  const undo = toast.onUndo

  return (
    <div
      role="status"
      key={toast.message}
      className="dark -translate-x-1/2 absolute bottom-5 left-1/2 z-20 flex max-w-[560px] animate-enter-up items-center gap-3 rounded-lg bg-popover px-3.5 py-2.5 text-popover-foreground shadow-overlay"
    >
      <span className="size-1.5 shrink-0 rounded-full bg-severity-resolved" />
      <span className="font-medium text-ui">{toast.message}</span>
      {undo && (
        <button
          type="button"
          onClick={() => {
            undo()
            useConsoleStore.getState().clearToast()
          }}
          className="focus-ring rounded-sm font-medium text-muted-foreground text-ui underline-offset-2 hover:text-foreground hover:underline"
        >
          Undo
        </button>
      )}
    </div>
  )
}
