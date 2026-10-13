import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { query } from '@anthropic-ai/claude-agent-sdk'
import { createLogger } from '@code-whiskers/logger'
import type { LlmReview } from '@code-whiskers/whiskers-domain'
import { addSpend, type TokenTally } from '../../../shared/llm'
import { AGENT_REVIEW_SYSTEM, reviewPrompt } from '../../prompt'
import {
  AGENT_RETRY,
  type CheckoutDir,
  createTail,
  isInsideCheckout,
  redactSecrets,
  STDERR_TAIL_CHARS,
} from '../agent'
import { ReviewProviderError } from '../errors'
import type { ReviewSession } from '../types'
import { claudeEnv } from './env'
import { buildClaudeOptions, readOnlyGuard } from './options'
import {
  classifySdkError,
  emptyRunState,
  observe,
  reviewFromRun,
  spendOf,
  verdictsFromRun,
} from './run'
import type { AgentCall, ClaudeRunState, ClaudeSessionSpec, ReviewSlice } from './types'
import { applyVerdicts, VERIFY_SYSTEM, verdictsJsonSchema, verifyPrompt } from './verify'

const logger = createLogger('whiskers-claude')

type SessionScope = {
  spec: ClaudeSessionSpec
  checkout: CheckoutDir
  configDir: string
  controllers: Set<AbortController>
}

async function runAgent(
  scope: SessionScope,
  call: AgentCall,
  tokens: TokenTally,
): Promise<ClaudeRunState> {
  const { spec, checkout, configDir, controllers } = scope
  const abortController = new AbortController()
  controllers.add(abortController)
  const timer = setTimeout(() => abortController.abort(), spec.limits.timeoutMs)
  const stderr = createTail(STDERR_TAIL_CHARS)
  let state = emptyRunState()
  try {
    const messages = query({
      prompt: call.prompt,
      options: buildClaudeOptions({
        cwd: checkout.root,
        env: claudeEnv(configDir, spec.isDev),
        systemPrompt: call.systemPrompt,
        config: { ...spec.config, model: call.model, maxTurns: spec.limits.maxTurns },
        executable: spec.binary,
        abortController,
        guard: readOnlyGuard(isInsideCheckout(checkout)),
        stderr: stderr.push,
        outputSchema: call.outputSchema,
      }),
    })
    for await (const message of messages) state = observe(state, message)
  } catch (error) {
    if (abortController.signal.aborted && !state.result) {
      throw new Error(`the Claude agent timed out after ${spec.limits.timeoutMs}ms`)
    }
    if (!state.result) throw classifySdkError(error, stderr.text())
  } finally {
    clearTimeout(timer)
    controllers.delete(abortController)
    if (state.result) addSpend(tokens, spendOf(state.result))
  }
  return state
}

/**
 * The checker re-reads each finding in the same checkout. If it fails for any reason short of a
 * provider-wide problem, the findings go out as raised rather than not at all.
 */
async function verify(
  scope: SessionScope,
  slice: ReviewSlice,
  review: LlmReview,
  tokens: TokenTally,
): Promise<LlmReview> {
  const model = scope.spec.config.verifyModel
  if (!model || review.findings.length === 0) return review
  try {
    const state = await runAgent(
      scope,
      {
        prompt: verifyPrompt(slice.diff, slice.context, review.findings),
        systemPrompt: VERIFY_SYSTEM,
        model,
        outputSchema: verdictsJsonSchema(),
      },
      tokens,
    )
    const checked = applyVerdicts(review, verdictsFromRun(state))
    logger.info(
      { raised: review.findings.length, kept: checked.findings.length, model },
      'findings checked',
    )
    return checked
  } catch (error) {
    if (error instanceof ReviewProviderError) throw error
    logger.warn({ err: String(error), model }, 'checker failed; posting findings unchecked')
    return review
  }
}

async function reviewSlice(
  scope: SessionScope,
  slice: ReviewSlice,
  tokens: TokenTally,
): Promise<LlmReview> {
  const state = await runAgent(
    scope,
    {
      prompt: reviewPrompt(slice.diff, slice.context),
      systemPrompt: AGENT_REVIEW_SYSTEM,
      model: scope.spec.config.model,
    },
    tokens,
  )
  const review = redactSecrets(reviewFromRun(state))
  return redactSecrets(await verify(scope, slice, review, tokens))
}

/** One checkout per review; `close` aborts what still runs, then removes it. */
export async function openClaudeSession(
  spec: ClaudeSessionSpec,
  checkout: CheckoutDir,
): Promise<ReviewSession> {
  let configDir: string
  try {
    configDir = await mkdtemp(join(tmpdir(), 'whiskers-claude-'))
  } catch (error) {
    await checkout.destroy()
    throw error
  }
  const scope: SessionScope = { spec, checkout, configDir, controllers: new Set() }
  return {
    retry: AGENT_RETRY,
    review: (diff, context, tokens) => reviewSlice(scope, { diff, context }, tokens),
    close: async () => {
      for (const controller of scope.controllers) controller.abort()
      await Promise.allSettled([
        checkout.destroy(),
        rm(configDir, { recursive: true, force: true }),
      ])
    },
  }
}
