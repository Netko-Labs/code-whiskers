export type MentionCommand = 'fix' | 'review' | 'ignore' | 'remember' | 'question'

export type MemoryKind = 'rule' | 'preference' | 'dont_flag' | 'context' | 'lesson'

export type RememberRequest = {
  kind: MemoryKind
  body: string
}

export type ParsedMention = {
  command: MentionCommand
  text: string
}

export type ThreadRoot = {
  id: number
  path: string
  line: number | null
  body: string
  author: string
}

export type MentionSource = {
  commentId: number | null
  isReviewComment: boolean
}
