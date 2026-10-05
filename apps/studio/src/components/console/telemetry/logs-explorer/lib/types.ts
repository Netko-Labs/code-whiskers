import type {
  LogFilterParams,
  TelemetryLevel,
  WhiskersLog,
  WindowSpec,
} from '@/integrations/whiskers'
import type { RangeSearch } from '../../shared/telemetry-time'

export type LogView = 'stream' | 'patterns'

export type LogSearch = RangeSearch & {
  q?: string
  service?: string
  levels?: TelemetryLevel[]
  attrs?: Record<string, string>
  traceId?: string
  view?: 'patterns'
  live?: boolean
}

export type LogChip = {
  key: string
  label: string
  value: string
  without: Partial<LogSearch>
}

/** What every part of the explorer reads: the URL search, and the queries it resolves to. */
export type LogsExplorerState = {
  search: LogSearch
  filter: LogFilterParams
  window: WindowSpec
  isLive: boolean
  isFiltered: boolean
  update: (patch: Partial<LogSearch>) => void
  refresh: () => void
}

export type LogsExplorerProps = {
  search: LogSearch
}

export type ExplorerPartProps = {
  explorer: LogsExplorerState
}

export type QueryToken =
  | { kind: 'service'; value: string }
  | { kind: 'level'; value: TelemetryLevel }
  | { kind: 'trace'; value: string }
  | { kind: 'attr'; key: string; value: string }

export type ParsedQuery = {
  tokens: QueryToken[]
  text: string
}

export type LogRowProps = {
  line: WhiskersLog
  isFresh: boolean
  isExpanded: boolean
  onToggle: (id: number) => void
  onFilter: (key: string, value: string) => void
}

export type LogRowDetailProps = {
  line: WhiskersLog
  onFilter: (key: string, value: string) => void
}
