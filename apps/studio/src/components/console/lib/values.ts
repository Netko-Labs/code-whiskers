import type { GoTarget, ShortcutGroup } from './types'

export const GO_TARGETS: GoTarget[] = [
  { key: 'o', label: 'Overview', path: '/console/overview' },
  { key: 'i', label: 'Inbox', bucket: 'inbox' },
  { key: 'a', label: 'Assigned to me', bucket: 'assigned' },
  { key: 'e', label: 'Issues', section: 'issues' },
  { key: 'r', label: 'Releases', section: 'releases' },
  { key: 'p', label: 'Pull requests', section: 'pull-requests' },
  { key: 'l', label: 'Live logs', section: 'live-logs' },
  { key: 't', label: 'Traces', section: 'traces' },
  { key: 's', label: 'Services', section: 'services' },
  { key: 'n', label: 'New project', path: '/console/projects/new' },
]

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'General',
    entries: [
      { keys: ['mod', 'k'], label: 'Search and run commands' },
      { keys: ['?'], label: 'Show keyboard shortcuts' },
      { keys: ['['], label: 'Collapse or expand the sidebar' },
      { keys: ['/'], label: 'Focus the search field on a list' },
    ],
  },
  {
    title: 'Go to',
    entries: GO_TARGETS.map((target) => ({ keys: ['g', target.key], label: target.label })),
  },
  {
    title: 'Lists',
    entries: [
      { keys: ['j'], label: 'Next row' },
      { keys: ['k'], label: 'Previous row' },
      { keys: ['enter'], label: 'Open the focused row' },
      { keys: ['escape'], label: 'Close a dialog or leave a field' },
    ],
  },
  {
    title: 'Triage',
    entries: [
      { keys: ['e'], label: 'Resolve the issue, or mark the item done' },
      { keys: ['s'], label: 'Snooze a review or log pattern' },
      { keys: ['enter'], label: 'Open the selected item in full' },
    ],
  },
]
