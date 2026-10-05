import { cn } from '@code-whiskers/ui/lib/utils'
import { DataList, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { Page, PageHeader } from '@/components/shared/page'
import { OtlpSetup } from '../shared/otlp-setup'
import { SaveViewButton } from '../shared/save-view'
import { formatDuration, rangeLabel } from '../shared/telemetry-time'
import {
  durationScale,
  isTraceSearchFiltered,
  suggestTraceViewName,
  TRACE_GRID,
  TRACE_RANGE_FALLBACK,
  type TracesPageProps,
  useTraces,
  useTraceUpdate,
} from './lib'
import { TraceRow } from './trace-row'
import { TracesToolbar } from './traces-toolbar'

const HEADER = ['Operation', 'Service', 'Duration', 'Spans', 'Errors', 'Started']

export function TracesPage({ search }: TracesPageProps) {
  const list = useTraces(search)
  const update = useTraceUpdate()
  const scaleMs = durationScale(list.traces, list.p95Ms)
  const errored = list.traces.filter((trace) => trace.errors > 0).length

  return (
    <Page>
      <PageHeader
        title="Traces"
        description="Each request your services traced, its root operation and how long it took."
        meta={
          <>
            <span className="font-mono tabular-nums">
              {rangeLabel(search, TRACE_RANGE_FALLBACK)}
            </span>
            {list.traces.length > 0 && (
              <>
                <span className="font-mono tabular-nums">p95 {formatDuration(list.p95Ms)}</span>
                <span className="font-mono tabular-nums">
                  {errored} of {list.traces.length} with errors
                </span>
              </>
            )}
          </>
        }
        actions={
          <SaveViewButton
            section="traces"
            params={{ ...search }}
            suggestion={suggestTraceViewName(search)}
          />
        }
      />
      <TracesToolbar search={search} update={update} />
      <div
        aria-hidden
        className={cn(
          'grid gap-x-4 border-border border-b px-gutter py-1.5 text-2xs text-faint',
          TRACE_GRID,
        )}
      >
        {HEADER.map((label, index) => (
          <span key={label} className={cn(index > 2 && 'text-right')}>
            {label}
          </span>
        ))}
      </div>
      {list.isPending ? (
        <DataListSkeleton rows={12} />
      ) : list.isError ? (
        <ErrorState size="inline" onRetry={list.retry} />
      ) : list.traces.length === 0 ? (
        isTraceSearchFiltered(search) ? (
          <EmptyState
            size="inline"
            expression="sleeping"
            title="No traces match"
            description="Nothing in this window passes every filter."
          />
        ) : (
          <OtlpSetup
            title="No traces in this window"
            description="Export spans over OTLP and every request shows up here as a waterfall."
          />
        )
      ) : (
        <>
          <DataList label="Traces">
            {list.traces.map((trace) => (
              <TraceRow key={trace.traceId} trace={trace} scaleMs={scaleMs} p95Ms={list.p95Ms} />
            ))}
          </DataList>
          <p className="m-0 px-gutter py-3 text-2xs text-faint">
            {list.traces.length >= 100 ? 'The newest 100 traces' : `${list.traces.length} traces`} ·
            the tick on each bar is p95 of this list
          </p>
        </>
      )}
    </Page>
  )
}
