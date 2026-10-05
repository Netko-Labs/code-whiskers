import { cn } from '@code-whiskers/ui/lib/utils'
import { IconAlertCircle, IconBoxMultiple } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import {
  FilterMenu,
  SortMenu,
  TOOLBAR_BUTTON,
  TOOLBAR_BUTTON_ACTIVE,
  Toolbar,
  ToolbarSearch,
  ToolbarSpacer,
} from '@/components/shared/toolbar'
import { whiskersServicesQuery } from '@/integrations/whiskers'
import { useConsoleScope } from '../../shared/console-scope'
import { RangePicker } from '../shared/range-picker'
import {
  MIN_DURATION_OPTIONS,
  SORT_OPTIONS,
  TRACE_RANGE_FALLBACK,
  type TracesToolbarProps,
  useDebouncedText,
} from './lib'

export function TracesToolbar({ search, update }: TracesToolbarProps) {
  const scope = useConsoleScope()
  const { data: services } = useQuery({ ...whiskersServicesQuery(scope.projectIds), retry: false })
  const [draft, setDraft] = useDebouncedText(search.q ?? '', (q) => update({ q: q || undefined }))
  const serviceOptions = (services ?? [])
    .filter((service) => service.spans > 0 || service.service === search.service)
    .map((service) => ({ value: service.service, label: service.service, count: service.spans }))

  return (
    <Toolbar>
      <ToolbarSearch value={draft} onValueChange={setDraft} placeholder="Operation or trace id…" />
      <FilterMenu
        label="Service"
        icon={IconBoxMultiple}
        options={serviceOptions}
        selected={search.service ? [search.service] : []}
        onToggle={(service) =>
          update({ service: service === search.service ? undefined : service })
        }
      />
      <button
        type="button"
        aria-pressed={!!search.errors}
        onClick={() => update({ errors: search.errors ? undefined : true })}
        className={cn(TOOLBAR_BUTTON, search.errors && TOOLBAR_BUTTON_ACTIVE)}
      >
        <IconAlertCircle className="size-3.5" stroke={1.75} />
        With errors
      </button>
      <SortMenu
        value={String(search.minMs ?? 0)}
        options={MIN_DURATION_OPTIONS}
        onValueChange={(value) => update({ minMs: Number(value) || undefined })}
      />
      <ToolbarSpacer />
      <SortMenu
        value={search.sort ?? 'recent'}
        options={SORT_OPTIONS}
        onValueChange={(sort) => update({ sort: sort === 'slowest' ? 'slowest' : undefined })}
      />
      <RangePicker
        search={search}
        fallback={TRACE_RANGE_FALLBACK}
        onChange={(range) => update({ range: range.range, from: undefined, to: undefined })}
      />
    </Toolbar>
  )
}
