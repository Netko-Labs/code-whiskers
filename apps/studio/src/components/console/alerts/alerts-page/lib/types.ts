export type AlertsTab = 'rules' | 'activity' | 'destinations'

export type AlertsPageProps = {
  tab: AlertsTab
}

export type AlertsTabItem = {
  key: AlertsTab
  label: string
  to: '/console/alerts' | '/console/alerts/activity' | '/console/alerts/destinations'
}

export type AlertCounts = Partial<Record<AlertsTab, number>>
