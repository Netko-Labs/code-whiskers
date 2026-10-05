import { Button } from '@code-whiskers/ui/components/button'
import { Shortcut } from '@/components/shared/kbd'
import { Panel } from '@/components/shared/page'
import { SHORTCUT_GROUPS } from '../../lib'
import { useConsoleStore } from '../../use-console-store'

/** The same list `?` opens, laid out to read rather than to glance at. */
export function AccountShortcuts() {
  return (
    <Panel
      title="Keyboard shortcuts"
      description="Single keys stand down while you type"
      actions={
        <Button
          size="sm"
          variant="ghost"
          onClick={() => useConsoleStore.getState().setShortcutsOpen(true)}
        >
          Open sheet <Shortcut keys={['?']} />
        </Button>
      }
    >
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {SHORTCUT_GROUPS.map((group) => (
          <section key={group.title} className="flex flex-col gap-1">
            <h3 className="m-0 pb-1 font-medium text-2xs text-muted-foreground">{group.title}</h3>
            {group.entries.map((entry) => (
              <div
                key={entry.label}
                className="flex items-center justify-between gap-3 py-0.5 text-ui"
              >
                <span className="min-w-0 truncate">{entry.label}</span>
                <Shortcut keys={entry.keys} />
              </div>
            ))}
          </section>
        ))}
      </div>
    </Panel>
  )
}
