import { IconBoxMultiple, IconRefresh, IconStack2 } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { FilterChips, FilterMenu, TOOLBAR_BUTTON, Toolbar } from '@/components/shared/toolbar'
import { whiskersServicesQuery } from '@/integrations/whiskers'
import { RangePicker } from '../../shared/range-picker'
import { LEVEL_OPTIONS } from '../../shared/telemetry-levels'
import {
  applyQuery,
  type ExplorerPartProps,
  LOG_RANGE_FALLBACK,
  logChips,
  parseQueryText,
  toggleLevel,
} from '../lib'
import { LogsQueryInput } from './logs-query-input'

export function LogsQueryBar({ explorer }: ExplorerPartProps) {
  const { search, update } = explorer
  const { data: services } = useQuery({
    ...whiskersServicesQuery(explorer.filter.projectIds),
    retry: false,
  })
  const serviceOptions = (services ?? [])
    .filter((service) => service.logs > 0 || service.service === search.service)
    .map((service) => ({ value: service.service, label: service.service, count: service.logs }))
  const chips = logChips(search).map(({ without, ...chip }) => ({
    ...chip,
    onRemove: () => update(without),
  }))

  return (
    <Toolbar className="gap-y-2">
      <LogsQueryInput
        key={search.q ?? ''}
        initial={search.q ?? ''}
        onSubmit={(text) => {
          const parsed = parseQueryText(text)
          update(applyQuery(search, parsed))
          return parsed.text
        }}
      />
      <FilterMenu
        label="Service"
        icon={IconBoxMultiple}
        options={serviceOptions}
        selected={search.service ? [search.service] : []}
        onToggle={(service) =>
          update({ service: service === search.service ? undefined : service })
        }
      />
      <FilterMenu
        label="Level"
        icon={IconStack2}
        options={LEVEL_OPTIONS}
        selected={search.levels ?? []}
        onToggle={(level) => update({ levels: toggleLevel(search.levels ?? [], level) })}
      />
      <RangePicker
        search={search}
        fallback={LOG_RANGE_FALLBACK}
        onChange={(range) => update({ range: range.range, from: undefined, to: undefined })}
      />
      {!explorer.isLive && (
        <button
          type="button"
          onClick={explorer.refresh}
          aria-label="Refresh"
          title="Refresh"
          className={TOOLBAR_BUTTON}
        >
          <IconRefresh className="size-3.5" stroke={1.75} />
        </button>
      )}
      {chips.length > 0 && (
        <FilterChips
          chips={chips}
          onClearAll={() => update({ service: undefined, traceId: undefined, attrs: undefined })}
          className="basis-full"
        />
      )}
    </Toolbar>
  )
}
