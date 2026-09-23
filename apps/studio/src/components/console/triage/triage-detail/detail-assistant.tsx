import { CatExpression } from '@code-whiskers/ui/brand'
import type { DetailPaneProps } from '../lib'

export function DetailAssistant({ item, actions }: Omit<DetailPaneProps, 'status'>) {
  return (
    <div className="flex shrink-0 items-start gap-3 rounded-2xl border border-border bg-surface-subtle px-4 py-3.5">
      <CatExpression expression="thinking" crop size={42} className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[13px]">Whiskers' read</span>
          <span className="font-mono text-[11px] text-muted-foreground">{item.confidence}</span>
        </div>
        <span className="text-[13px] text-body leading-[19px] text-pretty">{item.read}</span>
        {item.fixLabel && (
          <div className="mt-[3px] flex gap-1.5">
            <button
              type="button"
              onClick={actions.openFix}
              className="rounded-lg bg-foreground px-[9px] py-[5px] font-medium text-[11px] text-primary-foreground"
            >
              {item.fixLabel}
            </button>
            <button
              type="button"
              onClick={actions.onEvidence}
              className="rounded-lg border border-border bg-background px-[9px] py-[5px] font-medium text-[11px]"
            >
              {item.evidenceLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
