export type ReactionCommand = 'ignore' | 'fix' | 'explain'

export type ReactionContent = '-1' | 'rocket' | 'confused'

/** The slice of a GitHub review comment the scan reads. */
export type ScannedComment = {
  id: number
  inReplyToId: number | null
  author: string
  path: string
  line: number | null
  body: string
  reactions: Partial<Record<ReactionContent, number>>
}

export type PendingReaction = {
  rootId: number
  path: string
  line: number | null
  content: ReactionContent
  command: ReactionCommand
}

export type ActivePullRequest = {
  owner: string
  repo: string
  prNumber: number
}

export type CachedPermission = {
  isTrusted: boolean
  at: number
}
