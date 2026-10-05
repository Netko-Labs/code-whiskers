import type {
  IssuePeriod,
  WhiskersEventDetail,
  WhiskersIssue,
  WhiskersIssueDetail,
  WhiskersIssueEventList,
} from '@/integrations/whiskers'
import type { ConsoleItem } from '../../console-model'
import type { SampleIssueSeed } from '../types'
import { SAMPLE_EVENT_SEEDS, SAMPLE_FACETS, SAMPLE_ISSUE_SEEDS, SAMPLE_PROJECT_ID } from '../values'

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS
const CRUMB_SPACING_MS = 1_200

function issueFromSeed(seed: SampleIssueSeed, now: Date): WhiskersIssue {
  const { firstSeenAgoMs, lastSeenAgoMs, archivedForMs, ...rest } = seed
  return {
    ...rest,
    projectId: SAMPLE_PROJECT_ID,
    fingerprint: seed.id,
    firstSeen: new Date(now.getTime() - firstSeenAgoMs),
    lastSeen: new Date(now.getTime() - lastSeenAgoMs),
    archivedUntil: archivedForMs === null ? null : new Date(now.getTime() + archivedForMs),
    resolvedAt: seed.status === 'resolved' ? new Date(now.getTime() - lastSeenAgoMs) : null,
    regressedAt: seed.badges.includes('regressed') ? new Date(now.getTime() - lastSeenAgoMs) : null,
  }
}

export function sampleIssues(now = new Date()): WhiskersIssue[] {
  return SAMPLE_ISSUE_SEEDS.map((seed) => issueFromSeed(seed, now))
}

export function sampleIssue(issueId: string, now = new Date()): WhiskersIssue | undefined {
  const seed = SAMPLE_ISSUE_SEEDS.find((candidate) => candidate.id === issueId)
  return seed ? issueFromSeed(seed, now) : undefined
}

/** Sample error items get their fixture row so the list and detail read like live ones. */
export function withSampleIssue(item: ConsoleItem, now = new Date()): ConsoleItem {
  if (item.kind !== 'error' || !item.sourceId) return item
  return { ...item, issue: sampleIssue(item.sourceId, now) }
}

function spread(total: number, weights: number[]): number[] {
  const sum = weights.reduce((acc, weight) => acc + weight, 0) || 1
  return weights.map((weight) => Math.round((total * weight) / sum))
}

export function sampleIssueDetail(
  issue: WhiskersIssue,
  period: IssuePeriod,
  now = new Date(),
): WhiskersIssueDetail {
  const buckets = period === '24h' ? 24 : 14
  const step = period === '24h' ? HOUR_MS : DAY_MS
  const series =
    period === '24h'
      ? Array.from({ length: buckets }, (_, index) =>
          Math.round(((issue.trend.at(-1) ?? 0) / buckets) * (0.4 + (index % 5) / 4)),
        )
      : issue.trend
  const [major = 0, minor = 0] = spread(issue.eventCount, [5, 1])
  return {
    issue,
    environments: [
      { name: SAMPLE_FACETS.environments[0] ?? 'production', count: major },
      { name: SAMPLE_FACETS.environments[1] ?? 'staging', count: minor },
    ],
    releases: SAMPLE_FACETS.releases.map((name, index) => ({
      name,
      count: spread(issue.eventCount, [6, 3, 1])[index] ?? 0,
      firstSeen: new Date(now.getTime() - (index + 1) * 2 * DAY_MS),
    })),
    tags: Object.entries(SAMPLE_FACETS.tagKeys).map(([key, values]) => ({
      key,
      values: values.map((value, index) => ({
        value,
        count: spread(issue.eventCount, [6, 3, 1])[index] ?? 0,
      })),
    })),
    histogram: series.map((count, index) => ({
      bucket: new Date(now.getTime() - (series.length - 1 - index) * step),
      count,
    })),
  }
}

export function sampleIssueEvent(issue: WhiskersIssue): WhiskersEventDetail {
  const seed = SAMPLE_EVENT_SEEDS[issue.id]
  const at = issue.lastSeen.getTime()
  const crumbs = seed?.breadcrumbs ?? []
  return {
    id: `${issue.id}-latest`,
    eventId: `${issue.id.replace(/\D/g, '')}a1f09c2e4b7d`,
    prevId: null,
    nextId: null,
    receivedAt: issue.lastSeen,
    level: issue.level,
    message: seed?.message ?? issue.title,
    environment: seed?.environment ?? 'production',
    release: seed?.release ?? issue.lastRelease,
    traceId: null,
    frames: seed?.frames ?? [],
    breadcrumbs: crumbs.map((crumb, index) => ({
      ...crumb,
      timestamp: new Date(at - (crumbs.length - index) * CRUMB_SPACING_MS).toISOString(),
    })),
    tags: seed?.tags ?? {},
    request: seed?.request ?? null,
    logs: (seed?.logs ?? []).map((line, index) => ({
      ...line,
      timestamp: new Date(at - (index + 1) * CRUMB_SPACING_MS),
    })),
  }
}

export function sampleIssueEvents(issue: WhiskersIssue): WhiskersIssueEventList {
  const event = sampleIssueEvent(issue)
  return {
    events: [
      {
        id: event.id ?? issue.id,
        eventId: event.eventId,
        receivedAt: event.receivedAt,
        level: event.level,
        message: event.message,
        environment: event.environment,
        release: event.release,
      },
    ],
    nextCursor: null,
  }
}
