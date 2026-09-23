import {
  IconAlertCircle,
  IconArrowBackUp,
  IconBellRinging,
  IconBookmark,
  IconBoxMultiple,
  IconClock,
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
        to: TRIAGE_ROUTE,
        params: { bucket: 'inbox' },
      },
      {
        label: 'Assigned to me',
        icon: IconUser,
        to: TRIAGE_ROUTE,
        params: { bucket: 'assigned' },
      },
      {
        label: 'Snoozed',
        icon: IconClock,
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
        to: SECTION_ROUTE,
        params: { section: 'pull-requests' },
      },
      {
        label: 'Repositories',
        icon: IconFolders,
        to: SECTION_ROUTE,
        params: { section: 'repositories' },
      },
      {
        label: 'Codebase map',
        icon: IconTopologyStar3,
        to: SECTION_ROUTE,
        params: { section: 'codebase-map' },
      },
      {
        label: 'Review rules',
        icon: IconScale,
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
        to: SECTION_ROUTE,
        params: { section: 'issues' },
      },
      {
        label: 'Regressions',
        icon: IconArrowBackUp,
        to: SECTION_ROUTE,
        params: { section: 'regressions' },
      },
      {
        label: 'Releases',
        icon: IconTag,
        to: SECTION_ROUTE,
        params: { section: 'releases' },
      },
      {
        label: 'Alert rules',
        icon: IconBellRinging,
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
        to: SECTION_ROUTE,
        params: { section: 'live-logs' },
      },
      {
        label: 'Traces',
        icon: IconGitCommit,
        to: SECTION_ROUTE,
        params: { section: 'traces' },
      },
      {
        label: 'Services',
        icon: IconBoxMultiple,
        to: SECTION_ROUTE,
        params: { section: 'services' },
      },
      {
        label: 'Saved queries',
        icon: IconBookmark,
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
        to: SECTION_ROUTE,
        params: { section: 'members' },
      },
      {
        label: 'Integrations',
        icon: IconPlug,
        to: SECTION_ROUTE,
        params: { section: 'integrations' },
      },
      {
        label: 'API keys',
        icon: IconKey,
        to: SECTION_ROUTE,
        params: { section: 'api-keys' },
      },
      {
        label: 'Instance',
        icon: IconGauge,
        to: SECTION_ROUTE,
        params: { section: 'instance' },
      },
    ],
  },
]

export const RAIL_ITEMS: ConsoleNavItem[] = [
  { label: 'Inbox', icon: IconInbox, to: TRIAGE_ROUTE, params: { bucket: 'inbox' } },
  {
    label: 'Pull requests',
    icon: IconGitPullRequest,
    to: SECTION_ROUTE,
    params: { section: 'pull-requests' },
  },
  {
    label: 'Issues',
    icon: IconAlertCircle,
    to: SECTION_ROUTE,
    params: { section: 'issues' },
  },
  {
    label: 'Live logs',
    icon: IconScript,
    to: SECTION_ROUTE,
    params: { section: 'live-logs' },
  },
]
