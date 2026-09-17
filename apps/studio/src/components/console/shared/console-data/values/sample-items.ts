import type { ConsoleItem } from '../../console-model'
import { ISSUE_BILLING, ISSUE_CURSOR, ISSUE_SESSION } from './error-items'
import { LOG_DEPRECATIONS, LOG_INGEST_LATENCY } from './log-items'
import { REVIEW_FANOUT, REVIEW_SHIPPER } from './review-items'

export const SAMPLE_ITEMS: ConsoleItem[] = [
  ISSUE_SESSION,
  REVIEW_FANOUT,
  LOG_INGEST_LATENCY,
  ISSUE_BILLING,
  REVIEW_SHIPPER,
  LOG_DEPRECATIONS,
  ISSUE_CURSOR,
]
