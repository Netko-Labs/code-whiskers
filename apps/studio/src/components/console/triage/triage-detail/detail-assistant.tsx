import type { DetailPaneProps } from '../lib'

export function DetailAssistant({ item, actions }: Omit<DetailPaneProps, 'status'>) {
  return (
    <div className="flex shrink-0 items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[15px] tracking-[-0.01em]">Whiskers' read</span>
          <span className="font-mono text-[11px] text-muted-foreground">{item.confidence}</span>
        </div>
        <span className="whitespace-pre-line text-[13.5px] text-body leading-[21px] text-pretty">
          {item.read}
        </span>
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
