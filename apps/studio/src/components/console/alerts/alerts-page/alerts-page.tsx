import { buttonVariants } from '@code-whiskers/ui/components/button'
import { IconBellRinging, IconPlus } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Page, PageHeader, PageTabs } from '@/components/shared/page'
import { ActivityList } from '../activity-list'
import { DestinationList } from '../destination-list'
import { RuleList } from '../rule-list'
import { ALERTS_TABS, type AlertsPageProps, useAlertCounts } from './lib'

export function AlertsPage({ tab }: AlertsPageProps) {
  const navigate = useNavigate()
  const counts = useAlertCounts()

  return (
    <Page>
      <PageHeader
        icon={<IconBellRinging />}
        title="Alerts"
        description="Rules the worker checks every minute; studio delivers them to your destinations."
        actions={
          <Link to="/console/alerts/new" className={buttonVariants({ size: 'sm' })}>
            <IconPlus stroke={1.75} />
            New rule
          </Link>
        }
        tabs={
          <PageTabs
            label="Alerts"
            items={ALERTS_TABS.map((item) => ({
              key: item.key,
              label: item.label,
              count: counts[item.key],
              isActive: item.key === tab,
              onSelect: () => void navigate({ to: item.to }),
            }))}
          />
        }
      />
      {tab === 'rules' && <RuleList />}
      {tab === 'activity' && <ActivityList />}
      {tab === 'destinations' && <DestinationList />}
    </Page>
  )
}
