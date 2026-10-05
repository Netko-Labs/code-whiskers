import { cn } from '@code-whiskers/ui/lib/utils'
import { useState } from 'react'
import { DataList, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/page'
import { ApiKeyRow } from './api-key-row'
import { API_KEY_TABS, type ApiKeyListProps, type ApiKeyTab } from './lib'

export function ApiKeyList({ keys, onRevoke }: ApiKeyListProps) {
  const [tab, setTab] = useState<ApiKeyTab>('active')
  const shown = tab === 'active' ? keys.active : keys.revoked

  return (
    <Panel
      title="Your keys"
      description="Keys are personal: each reads with its creator's access, so you only see yours"
      actions={
        <div
          role="radiogroup"
          aria-label="Key status"
          className="flex gap-0.5 rounded-md bg-muted p-0.5"
        >
          {API_KEY_TABS.map((option) => (
            <button
              type="button"
              role="radio"
              key={option.value}
              aria-checked={tab === option.value}
              onClick={() => setTab(option.value)}
              className={cn(
                'focus-ring flex items-center gap-1.5 rounded-[5px] px-2 py-0.5 font-medium text-2xs transition-colors duration-fast',
                tab === option.value
                  ? 'bg-background text-foreground shadow-raised'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
              <span className="font-mono tabular-nums">{keys[option.value].length}</span>
            </button>
          ))}
        </div>
      }
      isFlush
    >
      {keys.isError ? (
        <ErrorState size="inline" onRetry={keys.retry} />
      ) : keys.isLoading ? (
        <DataListSkeleton rows={3} />
      ) : shown.length === 0 ? (
        <EmptyState
          size="inline"
          expression={tab === 'active' ? 'idle' : 'sleeping'}
          title={tab === 'active' ? 'No keys yet' : 'Nothing revoked'}
          description={
            tab === 'active'
              ? 'Create one above for a script, a dashboard or a CI job.'
              : 'Revoked keys stay here for the record.'
          }
        />
      ) : (
        <DataList key={tab} label={tab === 'active' ? 'Active keys' : 'Revoked keys'} isDivided>
          {shown.map((apiKey) => (
            <ApiKeyRow
              key={apiKey.id}
              apiKey={apiKey}
              onRevoke={tab === 'active' ? onRevoke : undefined}
            />
          ))}
        </DataList>
      )}
    </Panel>
  )
}
