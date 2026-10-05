import { IconCopy } from '@tabler/icons-react'
import { useConsoleStore } from '../../use-console-store'
import type { CodeBlockProps } from './lib'

export function CodeBlock({ snippet }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border">
      <div className="flex items-center justify-between border-border border-b bg-surface-subtle px-3 py-1.5">
        <span className="text-[12px] text-muted-foreground">{snippet.label}</span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(snippet.code)
            useConsoleStore.getState().flash(`${snippet.label} copied`)
          }}
          className="flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-[12px] text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <IconCopy className="size-3.5" stroke={1.75} />
          Copy
        </button>
      </div>
      <pre className="m-0 overflow-x-auto px-3.5 py-3 font-mono text-[12px] leading-5">
        <code>{snippet.code}</code>
      </pre>
    </div>
  )
}
