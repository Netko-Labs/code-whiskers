import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { generateText, stepCountIs, tool } from 'ai'
import { z } from 'zod'
import { AGENT_TIMEOUT_MS, TOOL_OUTPUT_LIMIT } from './constants'
import { fixModel } from './llm'
import type { AgentFixOutcome } from './types'
import type { FixWorkspace } from './workspace'

const AGENT_SYSTEM = `You are code-whiskers, an autonomous fix agent working inside a
checkout of a pull request branch. Resolve the request with the smallest correct
change. Read a file before editing it; writeFile replaces the whole file, so
always write the complete new content. When a run tool is available, verify your
change with it (tests, typecheck) before finishing. Never touch .git, lockfiles,
or unrelated code. You have a limited number of turns — be economical. Finish
with a one-to-three sentence summary of what you changed and why; it is posted
back to the PR thread.`

/**
 * The tool loop: list/read/write (+ run when sandboxed), hard-capped at
 * `fix.maxTurns` steps via stopWhen. The model's final text is the summary
 * posted back to the thread.
 */
export async function runFixAgent(
  workspace: FixWorkspace,
  request: string,
): Promise<AgentFixOutcome> {
  const exec = workspace.exec
  // Tool results are model-selected inputs — one lockfile read must not blow the context.
  const clamp = (text: string) =>
    text.length > TOOL_OUTPUT_LIMIT ? `${text.slice(0, TOOL_OUTPUT_LIMIT)}\n…[truncated]` : text
  const tools = {
    listFiles: tool({
      description: 'List every tracked file in the checkout',
      inputSchema: z.object({}),
      execute: async () => clamp((await workspace.listFiles()).join('\n')),
    }),
    readFile: tool({
      description: 'Read a file; path is relative to the repo root',
      inputSchema: z.object({ path: z.string() }),
      execute: async ({ path }) => clamp(await workspace.readFile(path)),
    }),
    writeFile: tool({
      description: 'Replace a file with new content; path is relative to the repo root',
      inputSchema: z.object({ path: z.string(), content: z.string() }),
      execute: async ({ path, content }) => {
        await workspace.writeFile(path, content)
        return `wrote ${path}`
      },
    }),
    ...(exec
      ? {
          run: tool({
            description: 'Run a shell command in the sandboxed checkout (no network access)',
            inputSchema: z.object({ command: z.string() }),
            execute: async ({ command }) => {
              const result = await exec(command)
              return clamp(`exit ${result.code}\n${result.stdout}\n${result.stderr}`)
            },
          }),
        }
      : {}),
  }

  const { text, steps } = await generateText({
    model: fixModel(),
    system: AGENT_SYSTEM,
    prompt: request,
    tools,
    stopWhen: stepCountIs(whiskersEnvConfig.fix.maxTurns),
    abortSignal: AbortSignal.timeout(AGENT_TIMEOUT_MS),
  })
  return { summary: text.trim(), steps: steps.length }
}
