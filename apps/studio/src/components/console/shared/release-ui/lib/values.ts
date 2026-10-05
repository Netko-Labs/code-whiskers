import type { CommitStatus } from '@/integrations/whiskers'
import type { VerdictLook } from './types'

export const VERDICT_LOOKS: Record<string, VerdictLook> = {
  approve: { tone: 'resolved', label: 'Approved' },
  request_changes: { tone: 'error', label: 'Changes requested' },
  comment: { tone: 'info', label: 'Commented' },
}

export const REVIEW_IN_FLIGHT: VerdictLook = { tone: 'neutral', label: 'Reviewing…' }
export const REVIEW_FAILED: VerdictLook = { tone: 'warning', label: 'Review failed' }

/** Why a release shows no commits, said once and pointing at the fix. */
export const COMMIT_STATUS_NOTES: Record<Exclude<CommitStatus, 'synced'>, string> = {
  pending: 'Reading commits from GitHub…',
  failed: 'GitHub did not answer for this range. It is retried on a later visit.',
  'no-repository':
    'No repository to read commits from. Link one to the project, or send repository with the deploy.',
  'no-commit': 'No commit to read from. Send commitSha with the deploy, or name releases by sha.',
}

export const DEFAULT_DEPLOY_ENVIRONMENT = 'production'
/** Coolify sets SOURCE_COMMIT on every build; CI systems have their own (GITHUB_SHA). */
export const DEPLOY_SHA_VARIABLE = 'SOURCE_COMMIT'

export const COMMIT_LINK = 'focus-ring rounded-sm hover:text-foreground hover:underline'
