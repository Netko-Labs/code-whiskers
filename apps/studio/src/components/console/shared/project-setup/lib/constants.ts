export const PLATFORM_IDS = [
  'node',
  'bun',
  'browser',
  'react',
  'nextjs',
  'tanstack-start',
  'python',
  'go',
  'ruby',
  'php',
  'java',
  'dotnet',
  'sentry',
  'otlp',
] as const

export const PLATFORM_GROUPS = ['JavaScript', 'Server', 'Anything else'] as const

export const DEFAULT_PLATFORM = 'node' satisfies (typeof PLATFORM_IDS)[number]
export const TEST_ERROR_MESSAGE = 'CodeWhiskers test error'
/** Realtime flips the listener; this only covers a socket that is down. */
export const LISTEN_FALLBACK_MS = 8_000
export const TEST_EVENT_TITLE = 'CodeWhiskers test event — your DSN works'
