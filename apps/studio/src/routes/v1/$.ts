import { forwardSignedInToWhiskers } from '@code-whiskers/studio-api'
import { createFileRoute } from '@tanstack/react-router'

function handler({ request }: { request: Request }) {
  return forwardSignedInToWhiskers(request)
}

export const Route = createFileRoute('/v1/$')({
  server: { handlers: { GET: handler, POST: handler } },
})
