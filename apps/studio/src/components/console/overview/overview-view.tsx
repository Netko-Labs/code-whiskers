import { Page, PageBody, PageHeader } from '@/components/shared/page'
import { ScopePicker } from '../scope-picker'
import { useViewer } from '../shared/console-data'
import { useConsoleScope } from '../shared/console-scope'
import { greetingFor, type OverviewViewProps, rangeLong } from './lib'
import { OverviewBoard } from './overview-board'
import { OverviewRangePicker } from './overview-range-picker'

/** The console's front door: how things stand, what needs a human, and what just happened. */
export function OverviewView({ range }: OverviewViewProps) {
  const viewer = useViewer()
  const scope = useConsoleScope()

  return (
    <Page>
      <PageHeader
        title={greetingFor(viewer?.name)}
        description={`${scope.label} over ${rangeLong(range)}.`}
        actions={
          <>
            <ScopePicker className="w-[200px]" />
            <OverviewRangePicker range={range} />
          </>
        }
      />
      <PageBody className="pt-2">
        <OverviewBoard range={range} />
      </PageBody>
    </Page>
  )
}
