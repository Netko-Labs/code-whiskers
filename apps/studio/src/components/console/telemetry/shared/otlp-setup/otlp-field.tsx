import { IconCopy } from '@tabler/icons-react'
import { useConsoleStore } from '../../../use-console-store'
import type { OtlpFieldProps } from './lib'

export function OtlpField({ label, value, copyLabel }: OtlpFieldProps) {
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value)
        useConsoleStore.getState().flash(`${copyLabel} copied`)
      }}
      className="group focus-ring grid w-full grid-cols-[88px_1fr_auto] items-center gap-3 rounded-lg border border-border bg-surface-subtle px-3 py-2 text-left transition-colors hover:border-ring/60"
    >
      <span className="text-2xs text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate font-mono text-foreground text-xs">{value}</span>
      <IconCopy
        className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground"
        stroke={1.75}
      />
    </button>
  )
}
