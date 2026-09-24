import { forwardToWhiskers } from '@code-whiskers/studio-api'
import { createFileRoute } from '@tanstack/react-router'

// OTLP exporters authenticate with the project key; whiskers checks it against the raw request.
function handler({ request }: { request: Request }) {
  return forwardToWhiskers(request)
}

export const Route = createFileRoute('/otlp/$')({
  server: { handlers: { POST: handler } },
})
