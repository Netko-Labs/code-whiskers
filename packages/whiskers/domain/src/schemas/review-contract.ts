import { z } from 'zod'
import { LOOP_VERDICTS } from '../values'

export const LoopVerdictSchema = z.enum(LOOP_VERDICTS)
export type LoopVerdict = z.infer<typeof LoopVerdictSchema>

/** One open finding as a coding agent reads it; `id` is stable across rounds. */
export const ContractFindingSchema = z.object({
  id: z.string(),
  since_round: z.number().int().positive(),
  file: z.string(),
  line: z.number().int().positive().nullable(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string(),
  done_when: z.string().nullable(),
  evidence: z.string().nullable(),
  thread: z.url().nullable(),
})
export type ContractFinding = z.infer<typeof ContractFindingSchema>

/** What the latest completed review says about a PR: the reviewer's half of the fix loop. */
export const ReviewContractSchema = z.object({
  pr: z.string(),
  head: z.string(),
  round: z.number().int().positive(),
  verdict: LoopVerdictSchema,
  blockers: z.array(ContractFindingSchema),
  suggestions: z.array(ContractFindingSchema),
  fixed_since_last_round: z.array(z.string()),
})
export type ReviewContract = z.infer<typeof ReviewContractSchema>

export const PullRequestParamSchema = z.object({
  owner: z.string().min(1).max(100),
  repo: z.string().min(1).max(100),
  number: z.coerce.number().int().positive(),
})
export type PullRequestParam = z.infer<typeof PullRequestParamSchema>

/** Studio → whiskers: a coding agent answering one finding, posted on its thread. */
export const AgentReplyBodySchema = z.object({
  pr: z.string().regex(/^[\w.-]+\/[\w.-]+#\d+$/),
  id: z.string().min(3).max(40),
  kind: z.enum(['fixed', 'disagree', 'question']),
  message: z.string().trim().min(3).max(2_000),
  agent: z.string().trim().min(1).max(100),
})
