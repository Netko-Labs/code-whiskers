import { cn } from '@code-whiskers/ui/lib/utils'
import type { ConsoleItem } from '../../../shared/console-model'
import { LogLines } from '../../../shared/console-ui'

const AXIS = ['-60m', '-45m', '-30m', '-15m', 'now']

export function LogDetail({ item }: { item: ConsoleItem }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-3 rounded-2xl border border-border px-[18px] py-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-[13px]">{item.metricLabel}</span>
            <span className="text-muted-foreground text-xs">{item.metricSub}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold font-mono text-[22px]">{item.metric}</span>
            <span className="text-severity-warning text-xs">{item.metricDelta}</span>
          </div>
        </div>
        <div className="flex h-24 items-end gap-1 border-border border-b pb-0.5">
          {(item.bars ?? []).map((bar, index) => (
            <div
              key={`${index}-${bar.percent}`}
              className={cn('flex-1 rounded-[1px]', bar.hot ? 'bg-severity-warning' : 'bg-border')}
              style={{ height: `${bar.percent}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between font-mono text-[10px] text-faint">
          {AXIS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="flex items-center justify-between border-border border-b bg-surface-subtle px-3.5 py-2.5">
          <span className="font-semibold text-[13px]">Matched lines</span>
          <span className="font-mono text-[11px] text-muted-foreground">{item.matchCount}</span>
        </div>
        <LogLines lines={item.lines ?? []} />
      </div>
    </div>
  )
}
