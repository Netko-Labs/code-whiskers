import { handleSentryTunnel } from '@code-whiskers/observability/server'
import { studioEnvConfig } from '@code-whiskers/studio-config'
import { createFileRoute } from '@tanstack/react-router'

// originGuard covers only Elysia's /api/*: the DSN allow-list and body cap are this route's guard.
export const Route = createFileRoute('/api/monitor')({
  server: {
    handlers: {
      POST: ({ request }) =>
        handleSentryTunnel(request, { allowedDsns: studioEnvConfig.observability.tunnelDsns }),
    },
  },
})
