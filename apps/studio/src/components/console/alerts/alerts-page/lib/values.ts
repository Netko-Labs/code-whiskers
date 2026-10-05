import type { AlertsTabItem } from './types'

export const ALERTS_TABS: AlertsTabItem[] = [
  { key: 'rules', label: 'Rules', to: '/console/alerts' },
  { key: 'activity', label: 'Activity', to: '/console/alerts/activity' },
  { key: 'destinations', label: 'Destinations', to: '/console/alerts/destinations' },
]
