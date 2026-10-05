import { Skeleton } from '@code-whiskers/ui/components/skeleton'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { Page, PageBody, PageHeader } from '@/components/shared/page'
import { Toolbar, ToolbarSearch, ToolbarSpacer } from '@/components/shared/toolbar'
import { OtlpSetup } from '../shared/otlp-setup'
import { RangePicker } from '../shared/range-picker'
import { rangeLabel } from '../shared/telemetry-time'
import { SERVICES_RANGE_FALLBACK, type ServicesPageProps, useServiceStats } from './lib'
import { ServiceCard } from './service-card'

export function ServicesPage({ search }: ServicesPageProps) {
  const stats = useServiceStats(search)
  const navigate = useNavigate({ from: '/console/services' })
  const [needle, setNeedle] = useState('')
  const visible = stats.services.filter((service) =>
    service.service.toLowerCase().includes(needle.trim().toLowerCase()),
  )

  return (
    <Page>
      <PageHeader
        title="Services"
        description="Every service.name that sent logs or spans: how busy, how failing, how fast."
        meta={
          <>
            <span className="font-mono tabular-nums">
              {rangeLabel(search, SERVICES_RANGE_FALLBACK)}
            </span>
            {stats.services.length > 0 && (
              <span className="font-mono tabular-nums">{stats.services.length} reporting</span>
            )}
          </>
        }
      />
      <Toolbar>
        <ToolbarSearch value={needle} onValueChange={setNeedle} placeholder="Filter services…" />
        <ToolbarSpacer />
        <RangePicker
          search={search}
          fallback={SERVICES_RANGE_FALLBACK}
          onChange={(range) => void navigate({ search: range, replace: true })}
        />
      </Toolbar>
      <PageBody width="full">
        {stats.isPending ? (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : stats.isError ? (
          <ErrorState size="inline" onRetry={stats.retry} />
        ) : stats.services.length === 0 ? (
          <OtlpSetup
            title="No services reporting"
            description="A service appears once its logs or spans arrive carrying a service.name."
          />
        ) : visible.length === 0 ? (
          <EmptyState size="inline" expression="sleeping" title="No services match" />
        ) : (
          <div className="stagger grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {visible.map((service) => (
              <ServiceCard
                key={service.service}
                stats={service}
                windowMs={stats.windowMs}
                search={search}
              />
            ))}
          </div>
        )}
      </PageBody>
    </Page>
  )
}
