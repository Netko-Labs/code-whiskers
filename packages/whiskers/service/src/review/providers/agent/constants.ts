import type { ChunkRetryPolicy } from '../types'

// An agent reads around the diff itself, so slices can be far larger than a single-shot prompt.
export const AGENT_CHUNK_CHARS = 60_000
export const AGENT_CONCURRENCY = 2
export const AGENT_RETRY: ChunkRetryPolicy = { maxAttempts: 1, splitsOnTimeout: false }
export const PROBE_MAX_TURNS = 3
export const PROBE_TIMEOUT_MS = 90_000
export const STDERR_TAIL_CHARS = 600

/** Never inherited wholesale: the worker's own env holds the database URL and the GitHub App key. */
export const AGENT_BASE_ENV = ['PATH', 'LANG', 'LC_ALL', 'TZ', 'TMPDIR'] as const
export const AGENT_PROXY_ENV = ['HTTPS_PROXY', 'HTTP_PROXY', 'NO_PROXY'] as const

/** Harness config a PR could ship to run code or rewrite instructions inside the reviewer. */
export const AGENT_CONFIG_PATHS = [
  '.claude',
  '.mcp.json',
  'CLAUDE.md',
  'CLAUDE.local.md',
  '.opencode',
  'opencode.json',
  'opencode.jsonc',
  '.codex',
] as const

/** Shapes of credentials an agent could be tricked into echoing into a finding. */
export const SECRET_PATTERNS: readonly RegExp[] = [
  /sk-ant-[A-Za-z0-9_-]{16,}/g,
  /sk-(?:proj-|or-v1-)?[A-Za-z0-9_-]{20,}/g,
  /gh[pousr]_[A-Za-z0-9]{30,}/g,
  /github_pat_[A-Za-z0-9_]{30,}/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
]
export const REDACTED = '[redacted]'
