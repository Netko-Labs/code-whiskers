import { useQuery } from '@tanstack/react-query'
import { whiskersInstanceQuery } from '@/integrations/whiskers'
import { SetupChecklistCard } from '../shared/setup-checklist'
import {
  isFreshInstance,
  type OverviewBoardProps,
  useOverviewData,
  useOverviewSignals,
} from './lib'
import { OverviewActivity } from './overview-activity'
import { OverviewAttention } from './overview-attention'
import { OverviewChart } from './overview-chart'
import { OverviewSetup } from './overview-setup'
import { OverviewStats } from './overview-stats'

/** Until the first review or error arrives there is nothing to chart: the setup steps lead. */
export function OverviewBoard({ range }: OverviewBoardProps) {
  const { data: worker } = useQuery({ ...whiskersInstanceQuery(), retry: false })
  const data = useOverviewData(range)
  const signals = useOverviewSignals()

  if (isFreshInstance(worker)) return <OverviewSetup />

  return (
    <>
      <OverviewStats range={range} data={data} signals={signals} />
      <div className="grid gap-4 lg:grid-cols-3">
        <OverviewChart range={range} data={data} />
        <OverviewActivity />
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <OverviewAttention signals={signals} />
        <SetupChecklistCard className="shrink-0 animate-enter-up lg:w-[320px]" />
      </div>
    </>
  )
}
