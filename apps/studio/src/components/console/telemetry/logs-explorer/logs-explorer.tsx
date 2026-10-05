import { Page, PageHeader, PageTabs } from '@/components/shared/page'
import { SaveViewButton } from '../shared/save-view'
import { rangeLabel } from '../shared/telemetry-time'
import { LOG_RANGE_FALLBACK, type LogsExplorerProps, suggestViewName, useLogsExplorer } from './lib'
import { LiveToggle } from './live-toggle'
import { LogsHistogram } from './logs-histogram'
import { LogsPatterns } from './logs-patterns'
import { LogsQueryBar } from './logs-query-bar'
import { LogsStream } from './logs-stream'

export function LogsExplorer({ search }: LogsExplorerProps) {
  const explorer = useLogsExplorer(search)
  const isPatterns = search.view === 'patterns'

  return (
    <Page>
      <PageHeader
        title="Live logs"
        description="Every line your services send over OTLP, searchable by text, level and attribute."
        meta={
          <span className="font-mono tabular-nums">{rangeLabel(search, LOG_RANGE_FALLBACK)}</span>
        }
        actions={
          <>
            <LiveToggle explorer={explorer} />
            <SaveViewButton
              section="live-logs"
              params={{ ...search }}
              suggestion={suggestViewName(search)}
            />
          </>
        }
        tabs={
          <PageTabs
            label="Logs view"
            items={[
              {
                key: 'stream',
                label: 'Stream',
                isActive: !isPatterns,
                onSelect: () => explorer.update({ view: undefined }),
              },
              {
                key: 'patterns',
                label: 'Patterns',
                isActive: isPatterns,
                onSelect: () => explorer.update({ view: 'patterns' }),
              },
            ]}
          />
        }
      />
      <LogsQueryBar explorer={explorer} />
      <LogsHistogram explorer={explorer} />
      {isPatterns ? (
        <LogsPatterns explorer={explorer} />
      ) : (
        <LogsStream key={JSON.stringify([explorer.filter, explorer.isLive])} explorer={explorer} />
      )}
    </Page>
  )
}
