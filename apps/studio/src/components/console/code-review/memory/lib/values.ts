import type { MemoryKind } from '@/integrations/studio-api'
import type { KindMeta, MemoryTab } from './types'

export const KIND_META: Record<MemoryKind, KindMeta> = {
  rule: {
    label: 'Rule',
    plural: 'Rules',
    hint: 'Must hold. Breaking it blocks the merge.',
    tone: 'error',
  },
  dont_flag: {
    label: "Don't flag",
    plural: "Don't flag",
    hint: 'Whiskers never raises this again.',
    tone: 'neutral',
  },
  lesson: {
    label: 'Lesson',
    plural: 'Lessons',
    hint: 'A bug that happened here. Whiskers looks harder.',
    tone: 'resolved',
  },
  context: {
    label: 'Context',
    plural: 'Context',
    hint: 'How this code works, so reviews make sense of it.',
    tone: 'info',
  },
  preference: {
    label: 'Preference',
    plural: 'Preferences',
    hint: 'How the team likes it. A suggestion, never a blocker.',
    tone: 'warning',
  },
}

export const KIND_ORDER: MemoryKind[] = ['rule', 'dont_flag', 'lesson', 'context', 'preference']

export const MEMORY_TABS: { key: MemoryTab; label: string }[] = [
  { key: 'all', label: 'All' },
  ...KIND_ORDER.map((kind) => ({ key: kind, label: KIND_META[kind].plural })),
  { key: 'retired', label: 'Retired' },
  { key: 'activity', label: 'Activity' },
]

export const EXAMPLE_NOTE = {
  kind: 'rule',
  body: 'Money is integer cents. Flag any float arithmetic on amounts, prices or totals.',
  paths: 'src/billing/**',
} as const

export const SOURCE_LABEL = {
  human: 'Written by',
  review: 'Learned in review',
  fix: 'Learned from a fix',
  agent: 'Added by an agent',
} as const

export const ACTION_VERB = {
  created: 'added',
  edited: 'edited',
  retired: 'retired',
  restored: 'restored',
  deleted: 'deleted',
  undone: 'undid a change to',
} as const

export const BODY_MIN = 3
export const BODY_MAX = 600
export const PATHS_MAX = 10
export const PATH_MAX = 200
export const WHOLE_INSTALLATION = ''
