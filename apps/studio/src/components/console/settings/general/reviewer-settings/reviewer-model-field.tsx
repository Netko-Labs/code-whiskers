import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from '@code-whiskers/ui/components/autocomplete'
import { Switch } from '@code-whiskers/ui/components/switch'
import { useQuery } from '@tanstack/react-query'
import { SettingRow } from '@/components/shared/page'
import { type CatalogModel, reviewerModelsQuery } from '@/integrations/studio-api'
import {
  isDisabledModel,
  MODEL_SEARCH_LIMIT,
  matchesModel,
  modelSummary,
  type ReviewerModelFieldProps,
} from './lib'

/** Free text with models.dev suggestions: any id still saves. Enter picks a suggestion, so it never saves. */
export function ReviewerModelField({ spec, value, provider, onChange }: ReviewerModelFieldProps) {
  const { data } = useQuery({
    ...reviewerModelsQuery(provider ?? 'openrouter'),
    enabled: provider !== null,
  })
  const models = provider ? (data?.models ?? []) : []
  const selected = models.find((model) => model.id === value.trim())
  const id = `reviewer-${spec.field}`
  const isOff = !!spec.offLabel && isDisabledModel(value)

  return (
    <SettingRow
      label={spec.label}
      htmlFor={id}
      description={selected ? `${spec.description} · ${modelSummary(selected)}` : spec.description}
    >
      <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
        {spec.offLabel && (
          <Switch
            checked={!isOff}
            onCheckedChange={(isOn) => onChange(isOn ? '' : 'off')}
            aria-label={`${spec.label} on`}
          />
        )}
        {isOff ? (
          <span className="h-8 w-full content-center font-mono text-muted-foreground text-xs sm:w-64">
            {spec.offLabel}
          </span>
        ) : (
          <Autocomplete
            items={models}
            value={value}
            onValueChange={onChange}
            itemToStringValue={(model: CatalogModel) => model.id}
            filter={matchesModel}
            limit={MODEL_SEARCH_LIMIT}
            openOnInputClick
          >
            <AutocompleteInput
              id={id}
              placeholder={spec.placeholder}
              autoComplete="off"
              spellCheck={false}
              className="h-8 w-full font-mono text-xs sm:w-64"
            />
            {models.length > 0 && (
              <AutocompleteContent align="end">
                <AutocompleteEmpty>No match on models.dev — any id still saves</AutocompleteEmpty>
                <AutocompleteList>
                  {(model: CatalogModel) => (
                    <AutocompleteItem key={model.id} value={model}>
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-ui">{model.name}</span>
                        <span className="shrink-0 font-mono text-2xs text-muted-foreground">
                          {model.id}
                        </span>
                      </span>
                      <span className="text-2xs text-muted-foreground tabular-nums">
                        {modelSummary(model)}
                      </span>
                    </AutocompleteItem>
                  )}
                </AutocompleteList>
              </AutocompleteContent>
            )}
          </Autocomplete>
        )}
      </div>
    </SettingRow>
  )
}
