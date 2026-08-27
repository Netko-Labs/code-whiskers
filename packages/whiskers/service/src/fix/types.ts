/**
 * A mention-triggered fix request. `commentId` anchors the reply to a review
 * thread (null → answer as a PR conversation comment); `path` + `line` anchor
 * a committable suggestion (either null → prose answer over the PR diff).
 */
export interface FixTarget {
  commentId: number | null
  path: string | null
  startLine: number | null
  line: number | null
  body: string
  author: string
}

/** What the agent loop hands back: its closing summary and how many turns it spent. */
export interface AgentFixOutcome {
  summary: string
  steps: number
}
