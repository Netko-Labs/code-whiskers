import { cn } from '@code-whiskers/ui/lib/utils'
import { IconAlertTriangle, IconTopologyStar3 } from '@tabler/icons-react'
import { useState } from 'react'
import { Page, PageHeader } from '@/components/shared/page'
import {
  TOOLBAR_BUTTON,
  TOOLBAR_BUTTON_ACTIVE,
  Toolbar,
  ToolbarSearch,
  ToolbarSpacer,
} from '@/components/shared/toolbar'
import { CodebaseMapBody } from './codebase-map-body'
import { useHotspotMap } from './lib'

export function CodebaseMapPage() {
  const [isBlockingOnly, setBlockingOnly] = useState(false)
  const [query, setQuery] = useState('')
  const state = useHotspotMap(isBlockingOnly, query)

  return (
    <Page>
      <PageHeader
        icon={<IconTopologyStar3 stroke={1.75} />}
        title="Codebase map"
        description={
          state.total === 0 ? 'Where review findings land across your repositories' : undefined
        }
        meta={
          state.total > 0 && (
            <>
              <span className="animate-enter">
                <span className="font-medium font-mono text-foreground">{state.total}</span>{' '}
                {state.total === 1 ? 'directory' : 'directories'} in {state.repositories}{' '}
                {state.repositories === 1 ? 'repository' : 'repositories'}
              </span>
              <span className="text-faint">·</span>
              <span className="animate-enter">
                <span className="font-medium font-mono text-foreground">{state.blocking}</span>{' '}
                blocking
              </span>
              <span className="text-faint">·</span>
              <span className="animate-enter">
                <span className="font-medium font-mono text-foreground">{state.unowned}</span>{' '}
                without an owner
              </span>
            </>
          )
        }
      />
      {state.total > 0 && (
        <Toolbar>
          <button
            type="button"
            aria-pressed={isBlockingOnly}
            onClick={() => setBlockingOnly(!isBlockingOnly)}
            className={cn(TOOLBAR_BUTTON, isBlockingOnly && TOOLBAR_BUTTON_ACTIVE)}
          >
            <IconAlertTriangle className="size-3.5" stroke={1.75} />
            Blocking only
          </button>
          <ToolbarSpacer />
          <ToolbarSearch value={query} onValueChange={setQuery} placeholder="Directory or owner…" />
        </Toolbar>
      )}
      <CodebaseMapBody state={state} isFiltered={isBlockingOnly || !!query.trim()} />
    </Page>
  )
}
