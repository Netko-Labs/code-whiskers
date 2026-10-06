import { describe, expect, test } from 'bun:test'
import { mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { HookInput, SDKMessage, SDKResultMessage } from '@anthropic-ai/claude-agent-sdk'
import { jailEnv } from '@code-whiskers/sandbox'
import { hostRuntime } from '../agent'
import { ReviewProviderError } from '../errors'
import { claudeEnvFor, containerClaudeEnv, hostClaudeEnv, jailClaudeEnv } from './env'
import { resolveClaudeExecutable, sandboxClaudeBinary } from './executable'
import { buildClaudeOptions, readOnlyGuard } from './options'
import { classifySdkError, emptyRunState, observe, reviewFromRun, spendOf } from './run'

const TOKEN = 'sk-ant-oat01-never-leaks-0000000000000000'
const WORKER_ENV = {
  PATH: '/usr/bin',
  HOME: '/root',
  DATABASE_URL: 'postgres://secret',
  GITHUB_APP_PRIVATE_KEY_B64: 'cHJpdmF0ZQ==',
  OPENROUTER_API_KEY: 'sk-or-v1-secret',
  INTERNAL_TOKEN: 'internal',
  CLAUDE_CODE_OAUTH_TOKEN: TOKEN,
}

const options = (env: Record<string, string>) =>
  buildClaudeOptions({
    cwd: '/tmp/checkout',
    env,
    systemPrompt: 'review',
    config: { model: 'claude-opus-5-5', effort: 'medium', maxTurns: 40, maxBudgetUsd: undefined },
    executable: null,
    abortController: new AbortController(),
    guard: async () => ({}),
    stderr: () => {},
    spawn: undefined,
  })

const result = (overrides: Partial<Record<string, unknown>>): SDKResultMessage =>
  ({
    type: 'result',
    subtype: 'success',
    is_error: false,
    num_turns: 7,
    result: '',
    total_cost_usd: 0.42,
    errors: [],
    usage: {},
    modelUsage: {
      'claude-opus-5-5': {
        inputTokens: 100,
        outputTokens: 50,
        thinkingTokens: 20,
        cacheReadInputTokens: 900,
        cacheCreationInputTokens: 10,
        webSearchRequests: 0,
        costUSD: 0.42,
        contextWindow: 1,
        maxOutputTokens: 1,
      },
    },
    ...overrides,
  }) as unknown as SDKResultMessage

const run = (...messages: unknown[]) =>
  messages.reduce(
    (state: ReturnType<typeof emptyRunState>, message) => observe(state, message as SDKMessage),
    emptyRunState(),
  )

const preToolUse = (toolName: string, toolInput: unknown) =>
  ({
    hook_event_name: 'PreToolUse',
    tool_name: toolName,
    tool_input: toolInput,
  }) as unknown as HookInput
const signal = { signal: new AbortController().signal }

describe('buildClaudeOptions', () => {
  test('read-only by construction', () => {
    const built = options({})
    expect(built.tools).toEqual(['Read', 'Grep', 'Glob'])
    expect(built.disallowedTools).toEqual(
      expect.arrayContaining(['Bash', 'Write', 'Edit', 'NotebookEdit', 'WebFetch', 'WebSearch']),
    )
    expect(built.disallowedTools).toEqual(expect.arrayContaining(['Task', 'mcp__*']))
    expect(built.permissionMode).toBe('dontAsk')
    expect(built.settingSources).toEqual([])
    expect(built.allowedTools).toBeUndefined()
    expect(built.persistSession).toBe(false)
    expect(built.outputFormat?.type).toBe('json_schema')
    expect(built.maxBudgetUsd).toBeUndefined()
  })

  test('the credential travels in env only, never elsewhere in the options', () => {
    const built = options(hostClaudeEnv('/tmp/config', false, WORKER_ENV))
    const { env, abortController, hooks, ...rest } = built
    expect(JSON.stringify(rest)).not.toContain(TOKEN)
    expect(env?.CLAUDE_CODE_OAUTH_TOKEN).toBe(TOKEN)
  })
})

describe('agent env', () => {
  test('the worker’s own secrets never reach the agent process', () => {
    for (const env of [
      hostClaudeEnv('/tmp/config', false, WORKER_ENV),
      containerClaudeEnv(WORKER_ENV),
      jailEnv(jailClaudeEnv(WORKER_ENV), '/tmp/whiskers-jail-x', 'http://127.0.0.1:41000'),
    ]) {
      for (const name of [
        'DATABASE_URL',
        'GITHUB_APP_PRIVATE_KEY_B64',
        'OPENROUTER_API_KEY',
        'INTERNAL_TOKEN',
      ]) {
        expect(env[name]).toBeUndefined()
      }
      expect(env.CLAUDE_CODE_DISABLE_AUTO_MEMORY).toBe('1')
    }
  })

  test('a fresh config dir and HOME, unless a dev worker borrows the local login', () => {
    const isolated = hostClaudeEnv('/tmp/config', false, WORKER_ENV)
    expect(isolated).toMatchObject({
      HOME: '/tmp/config',
      CLAUDE_CONFIG_DIR: '/tmp/config/.claude',
    })
    const { CLAUDE_CODE_OAUTH_TOKEN, ...withoutToken } = WORKER_ENV
    const local = hostClaudeEnv('/tmp/config', true, withoutToken)
    expect(local.HOME).toBe('/root')
    expect(local.CLAUDE_CONFIG_DIR).toBeUndefined()
    expect(hostClaudeEnv('/tmp/config', false, withoutToken).CLAUDE_CONFIG_DIR).toBeDefined()
  })

  test('inside the sandbox only container paths apply', () => {
    expect(containerClaudeEnv(WORKER_ENV)).toMatchObject({
      HOME: '/home/agent',
      CLAUDE_CONFIG_DIR: '/home/agent/.claude',
      PATH: '/usr/local/bin:/usr/bin:/bin',
    })
  })

  test('jailed: the worker’s HOME and proxy never apply; only the jail’s own do', () => {
    const worker = { ...WORKER_ENV, HTTPS_PROXY: 'http://user:pass@corp-proxy:3128' }
    const env = jailEnv(jailClaudeEnv(worker), '/tmp/whiskers-jail-x', 'http://127.0.0.1:41000')
    expect(env).toMatchObject({
      HOME: '/tmp/whiskers-jail-x',
      TMPDIR: '/tmp/whiskers-jail-x/tmp',
      HTTPS_PROXY: 'http://127.0.0.1:41000',
      HTTP_PROXY: 'http://127.0.0.1:41000',
      PATH: '/usr/local/bin:/usr/bin:/bin',
      CLAUDE_CODE_OAUTH_TOKEN: TOKEN,
    })
    expect(env.CLAUDE_CONFIG_DIR).toBeUndefined()
    expect(Object.values(env).join('\n')).not.toContain('pass@')
    expect(claudeEnvFor('jail', '/tmp/config', false).HOME).toBeUndefined()
    expect(claudeEnvFor('docker', '/tmp/config', false).HOME).toBe('/home/agent')
  })
})

describe('readOnlyGuard', () => {
  test('refuses other tools, paths outside the checkout and escaping globs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'guard-'))
    await mkdir(join(root, 'src'))
    await writeFile(join(root, 'src', 'a.ts'), 'x')
    await symlink('/etc/hosts', join(root, 'src', 'hosts'))
    const checkout = { dir: root, root: await realpath(root), destroy: async () => {} }
    const guard = readOnlyGuard(hostRuntime(checkout).isInside)
    const decision = async (tool: string, input: unknown) =>
      JSON.stringify(await guard(preToolUse(tool, input), undefined, signal))
    try {
      expect(await decision('Bash', { command: 'env' })).toContain('deny')
      expect(await decision('StructuredOutput', { findings: [] })).toBe('{}')
      expect(await decision('Read', { file_path: join(root, 'src', 'a.ts') })).toBe('{}')
      expect(await decision('Read', { file_path: 'src/a.ts' })).toBe('{}')
      expect(await decision('Read', { file_path: '/proc/self/environ' })).toContain('deny')
      expect(await decision('Read', { file_path: join(root, 'src', 'hosts') })).toContain('deny')
      expect(await decision('Grep', { pattern: 'x', path: '/etc' })).toContain('deny')
      expect(await decision('Grep', { pattern: 'x' })).toBe('{}')
      expect(await decision('Glob', { pattern: '../../**/*' })).toContain('deny')
      expect(await decision('Glob', { pattern: '**/*.ts' })).toBe('{}')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})

describe('reviewFromRun', () => {
  const answer = { findings: [], summary: 'fine', verdict: 'approve' }

  test('a success with structured output parses through the review schema', () => {
    expect(reviewFromRun(run(result({ structured_output: answer })))).toEqual({
      findings: [],
      summary: 'fine',
      verdict: 'approve',
    })
  })

  test.each([
    ['error_max_turns', 'ran out of turns'],
    ['error_max_budget_usd', 'REVIEW_AGENT_MAX_BUDGET_USD'],
    ['error_max_structured_output_retries', 'never produced output'],
    ['error_during_execution', 'the Claude agent failed'],
  ])('%s fails the slice, not the provider', (subtype, message) => {
    const state = run(result({ subtype, errors: ['boom'] }))
    expect(() => reviewFromRun(state)).toThrow(message)
    try {
      reviewFromRun(state)
    } catch (error) {
      expect(error).not.toBeInstanceOf(ReviewProviderError)
    }
  })

  test('a success without output, or with is_error, is a failure', () => {
    expect(() => reviewFromRun(run(result({})))).toThrow('without structured output')
    expect(() => reviewFromRun(run(result({ is_error: true, result: 'x' })))).toThrow('failed')
    expect(() => reviewFromRun(run())).toThrow('without a result')
  })

  test('a rejected rate limit is transient and carries its reset', () => {
    const state = run(
      {
        type: 'rate_limit_event',
        rate_limit_info: { status: 'rejected', resetsAt: 1_900_000_000 },
      },
      result({ subtype: 'error_during_execution' }),
    )
    try {
      reviewFromRun(state)
      throw new Error('expected a throw')
    } catch (error) {
      expect(error).toBeInstanceOf(ReviewProviderError)
      expect((error as ReviewProviderError).isTransient).toBe(true)
      expect((error as ReviewProviderError).retryAtMs).toBe(1_900_000_000_000)
    }
  })

  test.each([
    ['rate_limit', true],
    ['overloaded', true],
    ['authentication_failed', false],
    ['billing_error', false],
    ['oauth_org_not_allowed', false],
  ])('assistant error %s is a provider failure (transient: %p)', (kind, isTransient) => {
    const state = run({ type: 'assistant', error: kind, message: {} }, result({ is_error: true }))
    try {
      reviewFromRun(state)
      throw new Error('expected a throw')
    } catch (error) {
      expect(error).toBeInstanceOf(ReviewProviderError)
      expect((error as ReviewProviderError).isTransient).toBe(isTransient)
    }
  })

  test('an expired token says how to renew it', () => {
    const state = run(result({ is_error: true, result: 'OAuth token has expired' }))
    expect(() => reviewFromRun(state)).toThrow('claude setup-token')
  })
})

describe('spendOf', () => {
  test('folds every model’s usage into the tally’s shape', () => {
    expect(spendOf(result({}))).toEqual({
      input: 1010,
      cachedInput: 900,
      output: 50,
      reasoning: 20,
      turns: 7,
      costUsd: 0.42,
    })
  })
})

describe('classifySdkError', () => {
  test('a missing binary or a refused key is permanent; anything else passes through', () => {
    expect(classifySdkError(new Error('Claude Code native binary not found'))).toBeInstanceOf(
      ReviewProviderError,
    )
    expect(classifySdkError(new Error('Invalid API key'))).toBeInstanceOf(ReviewProviderError)
    const other = new Error('socket hang up')
    expect(classifySdkError(other)).toBe(other)
  })
})

describe('executable resolution', () => {
  const lookup = (configured: string | undefined, exists: boolean) =>
    resolveClaudeExecutable({ configured, mainDir: '/app/dist', exists: () => exists })

  test('CLAUDE_CODE_EXECUTABLE, then the bundled copy, then the SDK', () => {
    expect(lookup('/opt/claude', true)).toEqual({ path: '/opt/claude', source: 'env' })
    expect(lookup(undefined, true)).toEqual({ path: '/app/dist/claude/claude', source: 'bundled' })
    expect(lookup(undefined, false)).toEqual({ path: null, source: 'sdk' })
  })

  test('a sandbox mounts the host binary only on Linux', () => {
    const host = { path: '/app/dist/claude/claude', source: 'bundled' as const }
    expect(sandboxClaudeBinary(undefined, host, 'linux')).toBe('/app/dist/claude/claude')
    expect(sandboxClaudeBinary(undefined, host, 'darwin')).toBeNull()
    expect(sandboxClaudeBinary('/opt/linux/claude', host, 'darwin')).toBe('/opt/linux/claude')
  })
})
