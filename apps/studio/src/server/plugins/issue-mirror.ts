import { startIssueMirrorSweep } from '@code-whiskers/studio-service'
import { definePlugin } from 'nitro'

// Registered before shutdown.ts, so the sweep stops before the pool closes.
export default definePlugin((nitroApp) => {
  const stop = startIssueMirrorSweep()
  nitroApp.hooks.hook('close', stop)
})
