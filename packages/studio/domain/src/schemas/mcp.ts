import { z } from 'zod'

export const PR_REF_PATTERN = /^([\w.-]+)\/([\w.-]+)#(\d+)$/
const REPO_PATTERN = /^[\w.-]+\/[\w.-]+$/

const pr = z
  .string()
  .regex(PR_REF_PATTERN, 'write the pull request as owner/repo#number')
  .describe('The pull request, as owner/repo#number')
const repo = z
  .string()
  .regex(REPO_PATTERN, 'write the repository as owner/repo')
  .describe('owner/repo')

export const McpPrInputSchema = z.object({ pr })

export const McpWaitInputSchema = z.object({
  pr,
  sha: z.string().min(7).max(40).describe('The commit you pushed; waits until it is reviewed'),
  timeoutSeconds: z.number().int().min(10).max(600).default(300),
})

export const McpReplyInputSchema = z.object({
  pr,
  id: z.string().min(3).max(40).describe('The finding id from get_findings, e.g. wf_7c1e'),
  kind: z
    .enum(['fixed', 'disagree', 'question'])
    .describe('fixed: point at the commit; disagree: the checker rules next round; question: ask'),
  message: z.string().trim().min(3).max(2_000),
})

export const McpMemorySearchInputSchema = z.object({
  repo,
  query: z.string().max(500).default('').describe('Words to rank notes by; empty lists them all'),
  paths: z
    .array(z.string().max(300))
    .max(50)
    .default([])
    .describe('Files you are about to touch; keeps notes scoped to them plus repo-wide ones'),
})

export const McpMemoryWriteInputSchema = z.object({
  repo,
  body: z.string().trim().min(3).max(600).describe('One to three plain sentences'),
  paths: z.array(z.string().trim().min(1).max(200)).max(10).default([]),
})

/** What whiskers answers for a pull request's latest review; studio passes it through. */
export const LoopReviewSchema = z
  .object({
    pr: z.string(),
    head: z.string(),
    round: z.number(),
    verdict: z.string(),
    blockers: z.array(z.record(z.string(), z.unknown())),
    suggestions: z.array(z.record(z.string(), z.unknown())).default([]),
  })
  .passthrough()
export type LoopReview = z.infer<typeof LoopReviewSchema>
