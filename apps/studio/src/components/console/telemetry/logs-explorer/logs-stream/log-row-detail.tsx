import { buttonVariants } from '@code-whiskers/ui/components/button'
import { IconCopy, IconFilter, IconGitCommit } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { KeyValue, KeyValueList } from '@/components/shared/page'
import { formatAge } from '@/shared/format-date'
import { useConsoleStore } from '../../../use-console-store'
import { attributeEntries } from '../../shared/telemetry-attributes'
import { formatStamp } from '../../shared/telemetry-time'
import type { LogRowDetailProps } from '../lib'

const ACTION = buttonVariants({ size: 'sm', variant: 'outline' })

/** The line's evidence: the raw message on a dark pane, then every attribute — click to filter. */
export function LogRowDetail({ line, onFilter }: LogRowDetailProps) {
  const attributes = attributeEntries(line.attributes)

  return (
    <div className="flex animate-enter flex-col gap-3 border-rule-soft border-t bg-surface-subtle px-gutter py-3">
      <pre className="dark m-0 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-ink px-3 py-2.5 font-mono text-ink-text text-xs leading-5">
        {line.message}
      </pre>
      <div className="flex flex-wrap items-center gap-2">
        {line.traceId && (
          <Link to="/console/traces/$traceId" params={{ traceId: line.traceId }} className={ACTION}>
            <IconGitCommit className="size-3.5" stroke={1.75} />
            View trace
          </Link>
        )}
        <button
          type="button"
          className={ACTION}
          onClick={() => {
            void navigator.clipboard.writeText(line.message)
            useConsoleStore.getState().flash('Message copied')
          }}
        >
          <IconCopy className="size-3.5" stroke={1.75} />
          Copy message
        </button>
      </div>
      <div className="grid gap-x-8 lg:grid-cols-2">
        <KeyValueList>
          <KeyValue label="Time" isMono>
            {formatStamp(line.timestamp)}
            <span className="ml-2 text-muted-foreground">{formatAge(line.timestamp)} ago</span>
          </KeyValue>
          <KeyValue label="Service" isMono>
            {line.service}
          </KeyValue>
          <KeyValue label="Level" isMono>
            {line.level}
          </KeyValue>
          {line.traceId && (
            <KeyValue label="Trace" isMono>
              {line.traceId}
            </KeyValue>
          )}
          {line.spanId && (
            <KeyValue label="Span" isMono>
              {line.spanId}
            </KeyValue>
          )}
        </KeyValueList>
        <KeyValueList>
          {attributes.length === 0 && (
            <p className="m-0 py-1.5 text-2xs text-faint">No attributes on this line</p>
          )}
          {attributes.map(([key, value]) => (
            <KeyValue key={key} label={<span title={key}>{key}</span>} isMono>
              <button
                type="button"
                title={`Filter to ${key}:${value}`}
                onClick={() => onFilter(key, value)}
                className="group/attr focus-ring inline-flex max-w-full items-center gap-1.5 rounded-sm text-left hover:text-severity-info-ink"
              >
                <span className="truncate">{value}</span>
                <IconFilter
                  aria-hidden
                  className="size-3 shrink-0 opacity-0 transition-opacity group-hover/attr:opacity-100"
                  stroke={1.75}
                />
              </button>
            </KeyValue>
          ))}
        </KeyValueList>
      </div>
    </div>
  )
}
