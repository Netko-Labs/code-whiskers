import { CatExpression } from '@code-whiskers/ui/brand'
import { useEffect } from 'react'
import { TOAST_DURATION_MS } from '../lib'
import { useConsoleStore } from '../use-console-store'

export function ConsoleToast() {
  const toast = useConsoleStore((s) => s.toast)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => useConsoleStore.getState().clearToast(), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast])

  if (!toast) return null

  return (
    <div className="-translate-x-1/2 absolute bottom-[22px] left-1/2 z-20 flex max-w-[560px] animate-in items-center gap-3 rounded-xl bg-zinc-950 px-4 py-3 text-zinc-50 shadow-2xl duration-200 fade-in slide-in-from-bottom-2">
      <CatExpression expression="approved" tone="dark" crop size={30} />
      <span className="font-medium text-[13px]">{toast.message}</span>
      {toast.undoable && (
        <button
          type="button"
          onClick={() => useConsoleStore.getState().clearToast()}
          className="text-xs text-zinc-400 underline"
        >
          Undo
        </button>
      )}
    </div>
  )
}
