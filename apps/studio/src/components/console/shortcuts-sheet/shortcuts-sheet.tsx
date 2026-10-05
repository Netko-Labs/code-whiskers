import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@code-whiskers/ui/components/dialog'
import { Shortcut } from '@/components/shared/kbd'
import { SHORTCUT_GROUPS } from '../lib'
import { useConsoleStore } from '../use-console-store'

export function ShortcutsSheet() {
  const isOpen = useConsoleStore((s) => s.isShortcutsOpen)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => useConsoleStore.getState().setShortcutsOpen(next)}
    >
      <DialogContent className="gap-5 sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Single keys never fire while you are typing in a field.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {SHORTCUT_GROUPS.map((group) => (
            <section key={group.title} className="flex flex-col gap-1">
              <h3 className="m-0 mb-1 font-medium text-2xs text-muted-foreground">{group.title}</h3>
              {group.entries.map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-center justify-between gap-4 py-1 text-ui"
                >
                  <span className="truncate">{entry.label}</span>
                  <Shortcut keys={entry.keys} />
                </div>
              ))}
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
