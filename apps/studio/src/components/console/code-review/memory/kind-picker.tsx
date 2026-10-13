import { cn } from '@code-whiskers/ui/lib/utils'
import { SeverityDot } from '@/components/shared/status'
import { KIND_META, KIND_ORDER, type KindPickerProps } from './lib'

export function KindPicker({ value, onChange }: KindPickerProps) {
  return (
    <div role="radiogroup" aria-labelledby="note-kind" className="grid gap-1.5 sm:grid-cols-2">
      {KIND_ORDER.map((kind) => {
        const meta = KIND_META[kind]
        const isOn = value === kind
        return (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={isOn}
            onClick={() => onChange(kind)}
            className={cn(
              'focus-ring flex flex-col gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors duration-fast',
              isOn
                ? 'border-foreground/40 bg-surface-selected'
                : 'border-border hover:bg-surface-hover',
            )}
          >
            <span className="flex items-center gap-1.5 font-medium text-ui">
              <SeverityDot tone={meta.tone} size="sm" />
              {meta.label}
            </span>
            <span className="text-2xs text-muted-foreground">{meta.hint}</span>
          </button>
        )
      })}
    </div>
  )
}
