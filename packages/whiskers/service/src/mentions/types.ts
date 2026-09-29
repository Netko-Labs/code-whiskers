export type MentionCommand = 'fix' | 'review' | 'ignore' | 'question'

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
