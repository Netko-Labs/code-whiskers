import { REVIEW_PROVIDER_CREDENTIALS } from '@code-whiskers/whiskers-domain'

export const CLAUDE_TOOLS = ['Read', 'Grep', 'Glob'] as const
// How the CLI delivers `outputFormat`: the model calls it with the answer. Denying it means no answer.
export const STRUCTURED_OUTPUT_TOOL = 'StructuredOutput'

/** Bare names remove the tool from the model's context entirely, not just deny the call. */
export const CLAUDE_DENIED_TOOLS = [
  'Bash',
  'BashOutput',
  'KillShell',
  'Write',
  'Edit',
  'MultiEdit',
  'NotebookEdit',
  'WebFetch',
  'WebSearch',
  'Task',
  'Agent',
  'TodoWrite',
  'Skill',
  'SlashCommand',
  'ExitPlanMode',
  'AskUserQuestion',
  'mcp__*',
] as const

export const CLAUDE_CREDENTIALS = REVIEW_PROVIDER_CREDENTIALS.claude
export const CLAUDE_PASS_THROUGH = [...CLAUDE_CREDENTIALS, 'ANTHROPIC_BASE_URL'] as const
export const CLAUDE_FIXED_ENV = {
  CLAUDE_CODE_DISABLE_AUTO_MEMORY: '1',
  CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
  DISABLE_AUTOUPDATER: '1',
  CLAUDE_AGENT_SDK_CLIENT_APP: 'code-whiskers',
} as const
export const CLAUDE_API_HOST = 'api.anthropic.com'
export const BUNDLED_CLAUDE_PATH = 'claude/claude'
export const SDK_PACKAGE = '@anthropic-ai/claude-agent-sdk'

const RENEW_TOKEN =
  'run `claude setup-token` and update CLAUDE_CODE_OAUTH_TOKEN (or check ANTHROPIC_API_KEY)'

/** Assistant errors no retry fixes: the review fails with this as its summary. */
export const PERMANENT_CLAUDE_ERRORS: Record<string, string> = {
  authentication_failed: `Claude token expired or revoked — ${RENEW_TOKEN}`,
  oauth_org_not_allowed: `this Claude organization does not allow the token — ${RENEW_TOKEN}`,
  account_on_hold: 'the Claude account is on hold — resolve it at claude.ai',
  verification_required: 'the Claude account needs verification — sign in at claude.ai',
  billing_error: 'Claude refused for billing — check the plan or API credit',
  cloud_credential_error: 'Claude cloud credentials were rejected',
  model_not_found: 'Claude does not know REVIEW_MODEL — check the model id',
}

export const TRANSIENT_CLAUDE_ERRORS: ReadonlySet<string> = new Set(['rate_limit', 'overloaded'])

export const AUTH_FAILURE_TEXT =
  /oauth token (?:has )?(?:expired|been revoked)|authentication_failed|invalid (?:x-)?api[ -]key|invalid bearer token/i

// The CLI exits with this when it cannot spawn or find its native binary.
export const MISSING_BINARY_TEXT = /native binary not found|ENOENT|executable .* not found/i
