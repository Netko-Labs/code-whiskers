import type { TriageInput } from './set-triage-state'

export type TriageDecision = Omit<TriageInput, 'id' | 'installationId' | 'updatedBy' | 'updatedAt'>
