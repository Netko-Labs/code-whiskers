import type { WhiskersEventDetail, WhiskersIssue } from '@/integrations/whiskers'

/** Times are offsets from now, so the fixture never reads as months old. */
export type SampleIssueSeed = Omit<
  WhiskersIssue,
  | 'projectId'
  | 'fingerprint'
  | 'firstSeen'
  | 'lastSeen'
  | 'archivedUntil'
  | 'resolvedAt'
  | 'regressedAt'
> & {
  firstSeenAgoMs: number
  lastSeenAgoMs: number
  archivedForMs: number | null
}

export type SampleEventSeed = Pick<
  WhiskersEventDetail,
  'message' | 'environment' | 'release' | 'frames' | 'tags' | 'request'
> & {
  breadcrumbs: Omit<WhiskersEventDetail['breadcrumbs'][number], 'timestamp'>[]
  logs: Omit<WhiskersEventDetail['logs'][number], 'timestamp'>[]
}

export type SampleFacets = {
  environments: string[]
  releases: string[]
  tagKeys: Record<string, string[]>
}
