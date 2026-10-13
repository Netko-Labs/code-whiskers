import { createFileRoute, redirect } from '@tanstack/react-router'

/** Review rules became memory notes; old links land on the new page. */
export const Route = createFileRoute('/console/review-rules')({
  beforeLoad: () => {
    throw redirect({ to: '/console/memory' })
  },
})
