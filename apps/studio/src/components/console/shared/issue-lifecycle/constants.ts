import type { IssueBadge } from '@/integrations/whiskers'

export const MINUTE_MS = 60_000
export const HOUR_MS = 60 * MINUTE_MS
export const DAY_MS = 24 * HOUR_MS
export const WEEK_MS = 7 * DAY_MS
export const BADGE_ORDER: IssueBadge[] = ['regressed', 'spiking', 'new']
/** A hex string this long is a commit sha; seven characters is how git shows one. */
export const SHA_LENGTH = 12
export const SHORT_SHA_LENGTH = 7
export const TOAST_TITLE_LENGTH = 56
