import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { query } from '@anthropic-ai/claude-agent-sdk'
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
import type { ReviewSession } from '../types'
import { claudeEnv } from './env'
import { buildClaudeOptions, readOnlyGuard } from './options'
import { classifySdkError, emptyRunState, observe, reviewFromRun, spendOf } from './run'
import type { ClaudeSessionSpec, ReviewSlice } from './types'

async function runOnce(
  spec: ClaudeSessionSpec,
  checkout: CheckoutDir,
  configDir: string,
  slice: ReviewSlice,
  tokens: TokenTally,
  controllers: Set<AbortController>,
): Promise<LlmReview> {
  const abortController = new AbortController()
  controllers.add(abortController)
  const timer = setTimeout(() => abortController.abort(), spec.limits.timeoutMs)
  const stderr = createTail(STDERR_TAIL_CHARS)
  let state = emptyRunState()
  try {
    const messages = query({
      prompt: reviewPrompt(slice.diff, slice.context),
      options: buildClaudeOptions({
        cwd: checkout.root,
        env: claudeEnv(configDir, spec.isDev),
        systemPrompt: AGENT_REVIEW_SYSTEM,
        config: { ...spec.config, maxTurns: spec.limits.maxTurns },
        executable: spec.binary,
        abortController,
        guard: readOnlyGuard(isInsideCheckout(checkout)),
        stderr: stderr.push,
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
  return redactSecrets(reviewFromRun(state))
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
  const controllers = new Set<AbortController>()
  return {
    retry: AGENT_RETRY,
    review: (diff, context, tokens) =>
      runOnce(spec, checkout, configDir, { diff, context }, tokens, controllers),
    close: async () => {
      for (const controller of controllers) controller.abort()
      await Promise.allSettled([
        checkout.destroy(),
        rm(configDir, { recursive: true, force: true }),
      ])
    },
  }
}
