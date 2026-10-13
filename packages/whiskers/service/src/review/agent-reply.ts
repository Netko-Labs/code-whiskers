import { getPullRequestContract } from '../queries'
import { replyToReviewComment } from './github'
import type { AgentReply, AgentReplyInput, AgentReplyKind } from './types'

const MARKER = /<!-- whiskers-agent-reply agent="([^"]{1,100})" kind=(fixed|disagree|question) -->/
const PR_REF = /^([\w.-]+)\/([\w.-]+)#(\d+)$/
const COMMENT_ID = /#discussion_r(\d+)$/

const LEAD: Record<AgentReplyKind, string> = {
  fixed: 'says this is fixed',
  disagree: 'disagrees',
  question: 'asks',
}

export function renderAgentReply(agent: string, kind: AgentReplyKind, message: string): string {
  const name = agent.replace(/["\n<>]/g, '').slice(0, 100)
  return `**${name}** (coding agent, via MCP) ${LEAD[kind]}:\n\n${message.trim()}\n\n<!-- whiskers-agent-reply agent="${name}" kind=${kind} -->`
}

/** The agent's words without the label line and the marker, or null for any other comment. */
export function parseAgentReply(body: string): AgentReply | null {
  const match = MARKER.exec(body)
  if (!match?.[1] || !match[2]) return null
  const text = body
    .replace(MARKER, '')
    .replace(/^\*\*[^*]+\*\* \(coding agent, via MCP\)[^\n]*\n+/, '')
    .trim()
  return { agent: match[1], kind: match[2] as AgentReplyKind, body: text }
}

/**
 * Posts an agent's answer on the finding's own thread. The App posts it, so settling never
 * mistakes it for a human's word; the next review sees it and re-checks the claim instead.
 */
export async function postAgentReply(
  input: AgentReplyInput,
): Promise<{ url: string } | { error: string }> {
  const match = PR_REF.exec(input.pr)
  if (!match?.[1] || !match[2] || !match[3]) return { error: 'pr must be owner/repo#number' }
  const ref = { owner: match[1], repo: match[2], prNumber: Number(match[3]) }
  const contract = await getPullRequestContract(ref.owner, ref.repo, ref.prNumber)
  const finding = [...(contract?.blockers ?? []), ...(contract?.suggestions ?? [])].find(
    (item) => item.id === input.id,
  )
  if (!finding) return { error: `no open finding ${input.id} on ${input.pr}` }
  const commentId = finding.thread ? COMMENT_ID.exec(finding.thread)?.[1] : undefined
  if (!commentId) return { error: `${input.id} has no GitHub thread to answer on` }
  const url = await replyToReviewComment(
    ref,
    Number(commentId),
    renderAgentReply(input.agent, input.kind, input.message),
  )
  return { url }
}
