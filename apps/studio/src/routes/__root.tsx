import appCss from '@code-whiskers/ui/globals.css?url'
import { createRootRouteWithContext } from '@tanstack/react-router'
import type { RouterContext } from '@/components/core/root'
import { NotFound, RootDocument } from '@/components/core/root'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Code Whiskers' },
      {
        name: 'description',
        content: 'Code review, error tracking and logs for teams who would rather ship.',
      },
      { name: 'theme-color', content: '#09090b' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/logo192.png' },
      { rel: 'apple-touch-icon', href: '/logo192.png' },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})
