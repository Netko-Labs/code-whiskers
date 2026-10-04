import { createRouter } from '@tanstack/react-router'
import { reportQueryError } from '@/integrations/observability'
import { getContext } from '@/integrations/tanstack-query'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const { queryClient } = getContext()

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Loader and render errors land in route boundaries; a server response is the server's to report.
    defaultOnCatch: reportQueryError,
    context: {
      queryClient,
    },
  })

  return router
}
