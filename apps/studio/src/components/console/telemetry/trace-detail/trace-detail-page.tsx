import { buttonVariants } from '@code-whiskers/ui/components/button'
import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import {
  Page,
  PageBody,
  PageHeader,
  PageHeaderSkeleton,
  PanelSkeleton,
} from '@/components/shared/page'
import { SeverityDot } from '@/components/shared/status'
import { formatDuration, formatStamp } from '../shared/telemetry-time'
import {
  buildWaterfall,
  RELATED_SLACK_MS,
  rootOf,
  type TraceDetailPageProps,
  useSpanSelection,
  useTraceDetail,
} from './lib'
import { SpanPanel } from './span-panel'
import { TraceErrors, TraceRelatedLink } from './trace-parts'
import { TraceWaterfall } from './trace-waterfall'

export function TraceDetailPage({ traceId, spanId }: TraceDetailPageProps) {
  const detail = useTraceDetail(traceId)
  const select = useSpanSelection()

  if (detail.isPending) {
    return (
      <Page>
        <PageHeaderSkeleton />
        <PageBody width="full">
          <PanelSkeleton />
        </PageBody>
      </Page>
    )
  }
  if (detail.isError) return <ErrorState onRetry={detail.retry} />
  const root = rootOf(detail.spans)
  if (!root) {
    return (
      <EmptyState
        expression="sleeping"
        title="No spans for this trace"
        description="It may be older than the telemetry retention window, or still on its way."
        action={
          <Link to="/console/traces" className={buttonVariants({ size: 'sm', variant: 'outline' })}>
            Back to traces
          </Link>
        }
      />
    )
  }

  const waterfall = buildWaterfall(detail.spans)
  const selected = detail.spans.find((span) => span.spanId === spanId)
  const window = {
    from: Math.floor(waterfall.startMs - RELATED_SLACK_MS),
    to: Math.ceil(waterfall.startMs + waterfall.durationMs + RELATED_SLACK_MS),
  }

  return (
    <Page>
      <PageHeader
        title={root.name}
        meta={
          <>
            <span className="font-mono">{traceId}</span>
            <span className="font-mono tabular-nums">{formatDuration(waterfall.durationMs)}</span>
            <span className="font-mono tabular-nums">
              {detail.spans.length} spans · {waterfall.services.length} services
            </span>
            {waterfall.errors > 0 && (
              <span className="flex items-center gap-1.5 text-severity-error-ink">
                <SeverityDot tone="error" size="sm" />
                {waterfall.errors} failed {waterfall.errors === 1 ? 'span' : 'spans'}
              </span>
            )}
            <span className="font-mono tabular-nums">{formatStamp(root.startTime)}</span>
          </>
        }
        actions={<TraceRelatedLink traceId={traceId} context={detail.context} window={window} />}
      />
      <PageBody width="full">
        <TraceErrors context={detail.context} />
        <div
          className={cn(
            'grid items-start gap-4',
            selected && 'xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]',
          )}
        >
          <TraceWaterfall spans={detail.spans} selectedId={spanId} onSelect={select} />
          {selected && (
            <SpanPanel
              key={selected.spanId}
              span={selected}
              traceStartMs={waterfall.startMs}
              colorIndex={waterfall.services.indexOf(selected.service)}
              onClose={() => select(undefined)}
            />
          )}
        </div>
      </PageBody>
    </Page>
  )
}
