import type { RuleDraft } from './types'

export const EMPTY_DRAFT: RuleDraft = {
  installationId: null,
  name: '',
  triggers: ['new_issue'],
  projectIds: [],
  environment: '',
  minLevel: null,
  release: '',
  threshold: 10,
  windowMinutes: 5,
  notifyAll: true,
  destinationIds: [],
  actionIntervalMinutes: 30,
}

export const PREVIEW_DEBOUNCE_MS = 400
export const MAX_THRESHOLD = 1_000_000
export const MAX_WINDOW_MINUTES = 1_440
