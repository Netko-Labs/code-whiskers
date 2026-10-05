import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@code-whiskers/ui/components/chart'
import { Skeleton } from '@code-whiskers/ui/components/skeleton'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Panel } from '@/components/shared/page'
import { chartPoints, EVENTS_CHART, type OverviewChartProps, rangeLong } from './lib'

/** Error events against new issues: volume in blue, the new kinds of breakage in red. */
export function OverviewChart({ range, data }: OverviewChartProps) {
  const points = chartPoints(data.overview)
  const isQuiet = points.every((point) => point.events === 0 && point.newIssues === 0)

  return (
    <Panel
      title="Errors over time"
      description={`Events and new issues, ${rangeLong(range)}`}
      className="lg:col-span-2"
    >
      {data.isLoading ? (
        <Skeleton className="h-[220px] w-full" />
      ) : isQuiet ? (
        <div className="flex h-[220px] items-center justify-center text-muted-foreground text-ui">
          No error events in {rangeLong(range)}.
        </div>
      ) : (
        <ChartContainer
          config={EVENTS_CHART}
          className="aspect-auto h-[220px] w-full animate-enter"
        >
          <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="overview-events" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-events)" stopOpacity={0.24} />
                <stop offset="100%" stopColor="var(--color-events)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="2 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={32}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="events"
              type="monotone"
              stroke="var(--color-events)"
              strokeWidth={1.5}
              fill="url(#overview-events)"
            />
            <Area
              dataKey="newIssues"
              type="monotone"
              stroke="var(--color-newIssues)"
              strokeWidth={1.5}
              fill="none"
            />
          </AreaChart>
        </ChartContainer>
      )}
    </Panel>
  )
}
