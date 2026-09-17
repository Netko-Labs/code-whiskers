import { CatExpression } from '@code-whiskers/ui/brand'
import { Button } from '@code-whiskers/ui/components/button'
import { IconX } from '@tabler/icons-react'
import type { ConsoleItem } from '../../shared/console-model'
import { CodeHunk } from '../../shared/console-ui'
import type { DetailActions } from '../lib'

export function FixDrawer({ item, actions }: { item: ConsoleItem; actions: DetailActions }) {
  const fix = item.fix

  return (
    <div className="absolute inset-y-0 right-0 z-10 flex w-[436px] animate-in flex-col border-border border-l bg-background shadow-2xl duration-200 slide-in-from-right-4">
      <div className="flex items-start justify-between gap-3 border-border border-b px-[18px] py-4">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[15px] tracking-[-0.01em]">{fix.title}</span>
          <span className="text-muted-foreground text-xs">{fix.subtitle}</span>
        </div>
        <button type="button" onClick={actions.closeFix} aria-label="Close" className="text-faint">
          <IconX className="size-4" stroke={1.75} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 overflow-auto px-[18px] py-4">
        <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-subtle px-3.5 py-3">
          <CatExpression expression="approved" crop size={36} className="shrink-0" />
          <span className="text-[13px] text-body leading-[19px] text-pretty">{fix.note}</span>
        </div>

        {fix.hunk.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="border-border border-b bg-surface-subtle px-3 py-[9px] font-mono text-[11px] text-body">
              {fix.file}
            </div>
            <CodeHunk lines={fix.hunk} numberWidth="40px" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="font-semibold text-xs">Whiskers will also</span>
          {fix.steps.map((step) => (
            <div key={step} className="flex items-start gap-2.5">
              <span className="mt-[7px] size-[5px] shrink-0 rounded-full bg-faint" />
              <span className="text-[13px] text-body leading-[19px]">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-border border-t bg-surface-subtle px-[18px] py-3.5">
        <Button variant="outline" size="sm" onClick={actions.closeFix}>
          Cancel
        </Button>
        <Button size="sm" onClick={actions.commitFix}>
          {fix.cta}
        </Button>
      </div>
    </div>
  )
}
