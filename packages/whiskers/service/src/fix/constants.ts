// A stuck provider socket must surface as a failed run, never a silent hang.
export const LLM_TIMEOUT_MS = 180_000
export const MAX_DIFF_CHARS = 60_000
// Untrusted comment bodies are data for the prompt, never unbounded.
export const REQUEST_BODY_LIMIT = 10_000
// Concurrent mention-triggered fix replies across all PRs.
export const MAX_CONCURRENT_FIXES = 3

/**
 * Paths that never get a one-click suggestion: CI entrypoints would execute the
 * committed change with repo secrets, and lockfiles/manifests can smuggle
 * install-time scripts. Those requests get prose instead.
 */
export const PROTECTED_PATH_PATTERNS: readonly RegExp[] = [
  /^\.github\//,
  /(^|\/)\.gitlab-ci\.yml$/,
  // local composite actions (`uses: ./tools/action`) execute in CI with secrets
  /(^|\/)action\.ya?ml$/,
  // attribute filters and submodule sources shape what future git/CI runs execute
  /(^|\/)\.gitattributes$/,
  /(^|\/)\.gitmodules$/,
  /(^|\/)bun\.lock(b)?$/,
  /(^|\/)package-lock\.json$/,
  /(^|\/)yarn\.lock$/,
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)package\.json$/,
]
