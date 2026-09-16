import { forwardToWhiskers } from '@code-whiskers/studio-api'
import { createFileRoute } from '@tanstack/react-router'

function handler({ request }: { request: Request }) {
  return forwardToWhiskers(request)
}

export const Route = createFileRoute('/webhooks/$')({
  server: { handlers: { POST: handler } },
})
