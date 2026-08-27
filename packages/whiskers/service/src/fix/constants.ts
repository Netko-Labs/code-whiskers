// A stuck provider socket must surface as a failed run, never a silent hang.
export const LLM_TIMEOUT_MS = 180_000
// Whole-run ceiling across all agent turns.
export const AGENT_TIMEOUT_MS = 600_000
// The sandbox must outlive the worst-case agent run plus commit/push margin.
export const SANDBOX_TTL_MS = AGENT_TIMEOUT_MS + 5 * 60_000
export const TOOL_OUTPUT_LIMIT = 8_000
export const MAX_DIFF_CHARS = 60_000
// Concurrent mention-triggered fix runs across all PRs.
export const MAX_CONCURRENT_FIXES = 3

/**
 * Paths the agent must never modify: CI entrypoints would execute the pushed
 * commit with repo secrets, and lockfiles/manifests can smuggle install-time
 * scripts. Enforced both at the writeFile tool and again on the staged diff
 * before pushing (the sandbox `run` tool can write files without writeFile).
 */
export const PROTECTED_PATH_PATTERNS: readonly RegExp[] = [
  /^\.github\//,
  /(^|\/)\.gitlab-ci\.yml$/,
  /(^|\/)bun\.lock(b)?$/,
  /(^|\/)package-lock\.json$/,
  /(^|\/)yarn\.lock$/,
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)package\.json$/,
]
