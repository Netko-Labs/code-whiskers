import { useConsoleScope } from '../shared/console-scope'
import { SECTION_HOOKS, type SectionScreenProps, type SectionViewProps } from './lib'
import { SectionHeader } from './section-header'
import { SectionTable } from './section-table'
import { SectionToolbar } from './section-toolbar'

const TABLE_MIN_WIDTH = 1060

/** Keyed by section so each one mounts only its own data hook. */
export function SectionView({ section, tab, filters }: SectionViewProps) {
  return (
    <SectionScreen
      key={section}
      section={section}
      tab={tab}
      filters={filters}
      useDefinition={SECTION_HOOKS[section]}
    />
  )
}

function SectionScreen({ section, tab, filters, useDefinition }: SectionScreenProps) {
  const scope = useConsoleScope()
  const definition = useDefinition(tab, filters, scope)
  const table = typeof definition.table === 'function' ? definition.table(tab) : definition.table

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SectionHeader definition={definition} />
      <SectionToolbar section={section} tab={tab} filters={filters} definition={definition} />
      <SectionTable table={table} minWidth={TABLE_MIN_WIDTH} />
    </div>
  )
}
