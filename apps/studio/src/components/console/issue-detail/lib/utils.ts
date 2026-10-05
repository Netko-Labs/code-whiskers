import type { TriageActivity } from '@/integrations/studio-api'
import type { IssuePeriod, WhiskersEventDetail } from '@/integrations/whiskers'
import type { ConsoleTone, LogLevel, LogLine } from '../../shared/console-model'
import { plural, shortRelease } from '../../shared/issue-lifecycle'
import type { ActivityView, CrumbView, FrameGroup, TagShare } from './types'
import { CRUMB_KINDS, DEFAULT_CRUMB_KIND, FORMER_MEMBER, SYSTEM_ACTOR } from './values'

type Frame = WhiskersEventDetail['frames'][number]
type Crumb = WhiskersEventDetail['breadcrumbs'][number]

/** In-app frames stand alone; each run of library frames folds into one group. */
export function groupFrames(frames: Frame[]): FrameGroup[] {
  const groups: FrameGroup[] = []
  frames.forEach((frame, index) => {
    const last = groups.at(-1)
    if (frame.isInApp) groups.push({ kind: 'app', frame, index })
    else if (last?.kind === 'vendor') last.frames.push(frame)
    else groups.push({ kind: 'vendor', frames: [frame], index })
  })
  return groups
}

function crumbKind(crumb: Crumb): string {
  if (crumb.type && CRUMB_KINDS[crumb.type]) return crumb.type
  const category = crumb.category.toLowerCase()
  if (['fetch', 'xhr', 'http'].includes(category)) return 'http'
  if (category.startsWith('ui')) return 'ui'
  if (category.startsWith('db') || category.startsWith('query')) return 'query'
  if (category === 'navigation' || category === 'console') return category
  if (crumb.level === 'error' || crumb.level === 'fatal') return 'error'
  return 'default'
}

const CRUMB_TONE: Record<string, ConsoleTone> = { error: 'bad', fatal: 'bad', warning: 'warn' }

/** Sentry sends seconds since epoch or ISO strings; anything else shows no time. */
export function clockOf(value: Date | string | null): string {
  if (!value) return ''
  const date =
    typeof value === 'string'
      ? new Date(/^[0-9.]+$/.test(value) ? Number(value) * 1000 : value)
      : value
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString(undefined, { hour12: false })
}

export function crumbView(crumb: Crumb): CrumbView {
  const kind = CRUMB_KINDS[crumbKind(crumb)] ?? DEFAULT_CRUMB_KIND
  return {
    icon: kind.icon,
    label: crumb.category || kind.label,
    tone: CRUMB_TONE[crumb.level] ?? 'muted',
    time: clockOf(crumb.timestamp),
    message: crumb.message,
  }
}

const LOG_LEVEL: Record<string, LogLevel> = { ERROR: 'ERROR', FATAL: 'ERROR', WARN: 'WARN' }

export function logLinesOf(event: WhiskersEventDetail): LogLine[] {
  return event.logs.map((line) => ({
    time: clockOf(line.timestamp),
    level: LOG_LEVEL[line.level.toUpperCase()] ?? 'INFO',
    message: `${line.service}  ${line.message}`,
  }))
}

export function tagShares(values: { value: string; count: number }[]): TagShare[] {
  const total = values.reduce((sum, entry) => sum + entry.count, 0)
  return values.map((entry) => ({
    ...entry,
    percent: total === 0 ? 0 : Math.round((entry.count / total) * 100),
  }))
}

const HOUR_LABEL = new Intl.DateTimeFormat('en-US', { hour: '2-digit', hourCycle: 'h23' })
const DAY_LABEL = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

export function bucketLabel(bucket: Date, period: IssuePeriod): string {
  return period === '24h' ? `${HOUR_LABEL.format(bucket)}:00` : DAY_LABEL.format(bucket)
}

function text(data: Record<string, unknown> | null, key: string): string | null {
  const value = data?.[key]
  return typeof value === 'string' && value ? value : null
}

function count(data: Record<string, unknown> | null, key: string): number | null {
  const value = data?.[key]
  return typeof value === 'number' ? value : null
}

function archivedText(data: Record<string, unknown> | null): string {
  const mode = text(data, 'mode')
  const amount = count(data, 'count')
  if (mode === 'forever') return 'archived this forever'
  if (mode === 'events' && amount !== null)
    return `archived this until ${plural(amount, 'more event')}`
  if (mode === 'users' && amount !== null)
    return `archived this until ${plural(amount, 'more user')}`
  const until = text(data, 'until')
  if (mode === 'until' && until) {
    return `archived this until ${new Date(until).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`
  }
  return 'archived this'
}

function activityText(entry: TriageActivity): string {
  const { data } = entry
  const release = text(data, 'release')
  const after = release ? ` (after ${shortRelease(release)})` : ''
  switch (entry.kind) {
    case 'resolved':
      return text(data, 'mode') === 'next_release'
        ? `resolved this in the next release${after}`
        : 'resolved this'
    case 'unresolved':
      return 'reopened this'
    case 'archived':
      return archivedText(data)
    case 'regressed':
      return release
        ? `saw it again in ${shortRelease(release)} — regressed`
        : 'saw it again — regressed'
    case 'unarchived':
      return 'brought it back — the archive condition was met'
    case 'assigned': {
      const name = text(data, 'assigneeName')
      if (name) return `assigned this to ${name}`
      return data?.assigneeUserId === null ? 'unassigned this' : 'assigned this'
    }
    case 'commented':
      return 'commented'
    default:
      return entry.kind.replaceAll('_', ' ')
  }
}

/** One timeline row: who did what; CodeWhiskers speaks for itself when there is no person. */
export function activityView(entry: TriageActivity): ActivityView {
  const isSystem = entry.actorUserId === null && entry.actorName === null
  return {
    id: entry.id,
    who: isSystem ? SYSTEM_ACTOR : (entry.actorName ?? FORMER_MEMBER),
    image: entry.actorImage,
    isSystem,
    text: activityText(entry),
    body: entry.kind === 'commented' ? entry.body : null,
    at: entry.createdAt,
  }
}
