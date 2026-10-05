import { cn } from '@code-whiskers/ui/lib/utils'
import { IconX } from '@tabler/icons-react'
import { KeyValue, KeyValueList, Section } from '@/components/shared/page'
import { StatusBadge } from '@/components/shared/status'
import { attributeEntries } from '../shared/telemetry-attributes'
import { formatDuration, formatStamp } from '../shared/telemetry-time'
import { SPAN_KINDS, SPAN_STATUS_TONE, type SpanPanelProps, serviceFill } from './lib'

/** The selected span's properties, attributes and events, beside the waterfall. */
export function SpanPanel({ span, traceStartMs, colorIndex, onClose }: SpanPanelProps) {
  const attributes = attributeEntries(span.attributes)
  const offsetMs = span.startTime.getTime() - traceStartMs

  return (
    <aside
      aria-label={`Span ${span.name}`}
      className="flex min-w-0 animate-enter-right flex-col gap-5 rounded-xl border border-border bg-card p-4"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="m-0 break-words font-semibold text-foreground text-ui">{span.name}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 font-mono text-2xs text-muted-foreground">
              <span aria-hidden className={cn('size-2 rounded-[3px]', serviceFill(colorIndex))} />
              {span.service}
            </span>
            <StatusBadge tone={SPAN_STATUS_TONE[span.status]}>{span.status}</StatusBadge>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close span"
          onClick={onClose}
          className="focus-ring flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground"
        >
          <IconX className="size-4" stroke={1.75} />
        </button>
      </header>

      <KeyValueList>
        <KeyValue label="Duration" isMono>
          {formatDuration(span.durationMs)}
        </KeyValue>
        <KeyValue label="Starts at" isMono>
          +{formatDuration(offsetMs)}
        </KeyValue>
        <KeyValue label="Started" isMono>
          {formatStamp(span.startTime)}
        </KeyValue>
        <KeyValue label="Kind">{SPAN_KINDS[span.kind] ?? `Kind ${span.kind}`}</KeyValue>
        <KeyValue label="Span id" isMono>
          {span.spanId}
        </KeyValue>
        <KeyValue label="Parent" isMono>
          {span.parentSpanId ?? '—'}
        </KeyValue>
      </KeyValueList>

      <Section title="Attributes">
        {attributes.length === 0 ? (
          <p className="m-0 text-2xs text-faint">This span carries no attributes</p>
        ) : (
          <KeyValueList>
            {attributes.map(([key, value]) => (
              <KeyValue key={key} label={<span title={key}>{key}</span>} isMono>
                <span title={value}>{value}</span>
              </KeyValue>
            ))}
          </KeyValueList>
        )}
      </Section>

      {span.events.length > 0 && (
        <Section title="Events">
          <ol className="m-0 flex list-none flex-col gap-3 border-border border-l p-0 pl-3">
            {span.events.map((event, index) => (
              <li key={`${event.name}-${index}`} className="flex flex-col gap-1">
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                    +{formatDuration(event.timestamp.getTime() - span.startTime.getTime())}
                  </span>
                  <span
                    className={cn(
                      'font-medium text-ui',
                      event.name === 'exception' && 'text-severity-error-ink',
                    )}
                  >
                    {event.name}
                  </span>
                </span>
                {attributeEntries(event.attributes).map(([key, value]) => (
                  <span key={key} className="break-words font-mono text-2xs">
                    <span className="text-muted-foreground">{key} </span>
                    {value}
                  </span>
                ))}
              </li>
            ))}
          </ol>
        </Section>
      )}
    </aside>
  )
}
