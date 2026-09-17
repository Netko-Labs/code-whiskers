import {
  IconAlertCircle,
  IconArrowBackUp,
  IconBellRinging,
  IconBookmark,
  IconBoxMultiple,
  IconClock,
  IconCreditCard,
  IconFolders,
  IconGauge,
  IconGitCommit,
  IconGitPullRequest,
  IconInbox,
  IconKey,
  IconPlug,
  IconScale,
  IconScript,
  IconTag,
  IconTopologyStar3,
  IconUser,
  IconUsers,
} from '@tabler/icons-react'
import type { ConsoleNavGroup, ConsoleNavItem } from '../../console-model'

const TRIAGE_ROUTE = '/console/triage/$bucket'
const SECTION_ROUTE = '/console/$section'

export const NAV_GROUPS: ConsoleNavGroup[] = [
  {
    label: 'Triage',
    items: [
      {
        label: 'Inbox',
        icon: IconInbox,
        count: '7',
        to: TRIAGE_ROUTE,
        params: { bucket: 'inbox' },
      },
      {
        label: 'Assigned to me',
        icon: IconUser,
        count: '2',
        to: TRIAGE_ROUTE,
        params: { bucket: 'assigned' },
      },
      {
        label: 'Snoozed',
        icon: IconClock,
        count: '2',
        to: TRIAGE_ROUTE,
        params: { bucket: 'snoozed' },
      },
    ],
  },
  {
    label: 'Code review',
    items: [
      {
        label: 'Pull requests',
        icon: IconGitPullRequest,
        count: '6',
        to: SECTION_ROUTE,
        params: { section: 'pull-requests' },
      },
      {
        label: 'Repositories',
        icon: IconFolders,
        count: '14',
        to: SECTION_ROUTE,
        params: { section: 'repositories' },
      },
      {
        label: 'Codebase map',
        icon: IconTopologyStar3,
        count: '',
        to: SECTION_ROUTE,
        params: { section: 'codebase-map' },
      },
      {
        label: 'Review rules',
        icon: IconScale,
        count: '9',
        to: SECTION_ROUTE,
        params: { section: 'review-rules' },
      },
    ],
  },
  {
    label: 'Errors',
    items: [
      {
        label: 'Issues',
        icon: IconAlertCircle,
        count: '28',
        to: SECTION_ROUTE,
        params: { section: 'issues' },
      },
      {
        label: 'Regressions',
        icon: IconArrowBackUp,
        count: '2',
        to: SECTION_ROUTE,
        params: { section: 'regressions' },
      },
      {
        label: 'Releases',
        icon: IconTag,
        count: '3',
        to: SECTION_ROUTE,
        params: { section: 'releases' },
      },
      {
        label: 'Alert rules',
        icon: IconBellRinging,
        count: '11',
        to: SECTION_ROUTE,
        params: { section: 'alert-rules' },
      },
    ],
  },
  {
    label: 'Telemetry',
    items: [
      {
        label: 'Live logs',
        icon: IconScript,
        count: '8',
        to: SECTION_ROUTE,
        params: { section: 'live-logs' },
      },
      {
        label: 'Traces',
        icon: IconGitCommit,
        count: '',
        to: SECTION_ROUTE,
        params: { section: 'traces' },
      },
      {
        label: 'Services',
        icon: IconBoxMultiple,
        count: '12',
        to: SECTION_ROUTE,
        params: { section: 'services' },
      },
      {
        label: 'Saved queries',
        icon: IconBookmark,
        count: '5',
        to: SECTION_ROUTE,
        params: { section: 'saved-queries' },
      },
    ],
  },
  {
    label: 'Organization',
    items: [
      {
        label: 'Members',
        icon: IconUsers,
        count: '9',
        to: SECTION_ROUTE,
        params: { section: 'members' },
      },
      {
        label: 'Integrations',
        icon: IconPlug,
        count: '4',
        to: SECTION_ROUTE,
        params: { section: 'integrations' },
      },
      {
        label: 'API keys',
        icon: IconKey,
        count: '4',
        to: SECTION_ROUTE,
        params: { section: 'api-keys' },
      },
      {
        label: 'Usage & quota',
        icon: IconGauge,
        count: '',
        to: SECTION_ROUTE,
        params: { section: 'usage' },
      },
      {
        label: 'Billing',
        icon: IconCreditCard,
        count: '',
        to: SECTION_ROUTE,
        params: { section: 'billing' },
      },
    ],
  },
]

export const RAIL_ITEMS: ConsoleNavItem[] = [
  { label: 'Inbox', icon: IconInbox, count: '', to: TRIAGE_ROUTE, params: { bucket: 'inbox' } },
  {
    label: 'Pull requests',
    icon: IconGitPullRequest,
    count: '',
    to: SECTION_ROUTE,
    params: { section: 'pull-requests' },
  },
  {
    label: 'Issues',
    icon: IconAlertCircle,
    count: '',
    to: SECTION_ROUTE,
    params: { section: 'issues' },
  },
  {
    label: 'Live logs',
    icon: IconScript,
    count: '',
    to: SECTION_ROUTE,
    params: { section: 'live-logs' },
  },
]
