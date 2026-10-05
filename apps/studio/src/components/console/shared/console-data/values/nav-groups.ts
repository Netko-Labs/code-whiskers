import {
  IconActivity,
  IconAlertCircle,
  IconArrowBackUp,
  IconBellRinging,
  IconBookmark,
  IconBoxMultiple,
  IconBug,
  IconBuildingCommunity,
  IconClock,
  IconCode,
  IconFolders,
  IconGauge,
  IconGitCommit,
  IconGitPullRequest,
  IconInbox,
  IconKey,
  IconLayoutDashboard,
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

/** Always visible above the groups: what needs a human right now. */
export const NAV_PRIMARY: ConsoleNavItem[] = [
  { label: 'Overview', icon: IconLayoutDashboard, to: '/console/overview' },
  { label: 'Inbox', icon: IconInbox, to: TRIAGE_ROUTE, params: { bucket: 'inbox' } },
  { label: 'Assigned to me', icon: IconUser, to: TRIAGE_ROUTE, params: { bucket: 'assigned' } },
  { label: 'Snoozed', icon: IconClock, to: TRIAGE_ROUTE, params: { bucket: 'snoozed' } },
]

export const NAV_GROUPS: ConsoleNavGroup[] = [
  {
    label: 'Errors',
    icon: IconBug,
    items: [
      { label: 'Issues', icon: IconAlertCircle, to: SECTION_ROUTE, params: { section: 'issues' } },
      {
        label: 'Regressions',
        icon: IconArrowBackUp,
        to: SECTION_ROUTE,
        params: { section: 'regressions' },
      },
      { label: 'Releases', icon: IconTag, to: SECTION_ROUTE, params: { section: 'releases' } },
      {
        label: 'Alert rules',
        icon: IconBellRinging,
        to: SECTION_ROUTE,
        params: { section: 'alert-rules' },
      },
    ],
  },
  {
    label: 'Code review',
    icon: IconCode,
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
    label: 'Telemetry',
    icon: IconActivity,
    items: [
      { label: 'Live logs', icon: IconScript, to: SECTION_ROUTE, params: { section: 'live-logs' } },
      { label: 'Traces', icon: IconGitCommit, to: SECTION_ROUTE, params: { section: 'traces' } },
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
    icon: IconBuildingCommunity,
    items: [
      { label: 'Members', icon: IconUsers, to: SECTION_ROUTE, params: { section: 'members' } },
      {
        label: 'Integrations',
        icon: IconPlug,
        to: SECTION_ROUTE,
        params: { section: 'integrations' },
      },
      { label: 'API keys', icon: IconKey, to: SECTION_ROUTE, params: { section: 'api-keys' } },
      { label: 'Instance', icon: IconGauge, to: SECTION_ROUTE, params: { section: 'instance' } },
    ],
  },
]

/** The collapsed rail keeps one door into each surface. */
export const RAIL_ITEMS: ConsoleNavItem[] = [
  ...NAV_PRIMARY.slice(0, 3),
  { label: 'Issues', icon: IconAlertCircle, to: SECTION_ROUTE, params: { section: 'issues' } },
  {
    label: 'Pull requests',
    icon: IconGitPullRequest,
    to: SECTION_ROUTE,
    params: { section: 'pull-requests' },
  },
  { label: 'Live logs', icon: IconScript, to: SECTION_ROUTE, params: { section: 'live-logs' } },
  { label: 'Traces', icon: IconGitCommit, to: SECTION_ROUTE, params: { section: 'traces' } },
  { label: 'Members', icon: IconUsers, to: SECTION_ROUTE, params: { section: 'members' } },
]
