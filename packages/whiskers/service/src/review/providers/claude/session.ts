import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { query } from '@anthropic-ai/claude-agent-sdk'
import type { LlmReview } from '@code-whiskers/whiskers-domain'
import { addSpend, type TokenTally } from '../../../shared/llm'
import { AGENT_REVIEW_SYSTEM, reviewPrompt } from '../../prompt'
import {
  AGENT_RETRY,
  type AgentRuntime,
  type CheckoutDir,
  createTail,
  redactSecrets,
  STDERR_TAIL_CHARS,
} from '../agent'
import type { ReviewSession } from '../types'
import { claudeEnvFor, definedEnv } from './env'
import { buildClaudeOptions, readOnlyGuard } from './options'
import { classifySdkError, emptyRunState, observe, reviewFromRun, spendOf } from './run'
import type { ClaudeSessionSpec, ReviewSlice } from './types'

async function runOnce(
  spec: ClaudeSessionSpec,
  runtime: AgentRuntime,
  configDir: string,
  slice: ReviewSlice,
  tokens: TokenTally,
  controllers: Set<AbortController>,
): Promise<LlmReview> {
  const abortController = new AbortController()
  controllers.add(abortController)
  const timer = setTimeout(() => abortController.abort(), spec.limits.timeoutMs)
  const { spawn } = runtime
  const binary = runtime.kind === 'docker' ? spec.containerBinary : spec.hostBinary
  const stderr = createTail(STDERR_TAIL_CHARS)
  let state = emptyRunState()
  try {
    const messages = query({
      prompt: reviewPrompt(slice.diff, slice.context),
      options: buildClaudeOptions({
        cwd: runtime.workdir,
        env: claudeEnvFor(runtime.kind, configDir, spec.isDev),
        systemPrompt: AGENT_REVIEW_SYSTEM,
        config: { ...spec.config, maxTurns: spec.limits.maxTurns },
        executable: binary,
        abortController,
        guard: readOnlyGuard(runtime.isInside),
        stderr: stderr.push,
        spawn:
          spawn && binary
            ? ({ args, env }) => {
                const child = spawn([binary, ...args], definedEnv(env))
                child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk.toString()))
                return child
              }
            : undefined,
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

/** One checkout and one runtime per review; `close` aborts what still runs, then removes both. */
export async function openClaudeSession(
  spec: ClaudeSessionSpec,
  checkout: CheckoutDir,
  openRuntime: (checkout: CheckoutDir) => Promise<AgentRuntime>,
): Promise<ReviewSession> {
  const configDir = await mkdtemp(join(tmpdir(), 'whiskers-claude-'))
  const removeConfig = () => rm(configDir, { recursive: true, force: true })
  const controllers = new Set<AbortController>()
  let runtime: AgentRuntime
  try {
    runtime = await openRuntime(checkout)
  } catch (error) {
    await Promise.allSettled([checkout.destroy(), removeConfig()])
    throw error
  }
  return {
    retry: AGENT_RETRY,
    review: (diff, context, tokens) =>
      runOnce(spec, runtime, configDir, { diff, context }, tokens, controllers),
    close: async () => {
      for (const controller of controllers) controller.abort()
      await Promise.allSettled([runtime.destroy(), checkout.destroy(), removeConfig()])
    },
  }
}
