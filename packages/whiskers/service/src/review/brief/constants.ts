export const BRIEF_MARKER = '<!-- whiskers-merge-brief -->'
export const HOTSPOT_LIMIT = 5
export const LIST_LIMIT = 8
export const MEMORY_LIMIT = 5

export const HEADLINE = {
  mergeable: 'Mergeable',
  needs_changes: 'Needs changes',
  blocked: 'Blocked',
  needs_human: 'Needs a human',
} as const

export const HUMAN_REASON = {
  round_limit: 'the coding agent used all 5 rounds without clearing every blocker',
  stalled: 'two pushes in a row left the same blockers standing',
} as const
