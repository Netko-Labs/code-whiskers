import { closeDb } from '@code-whiskers/studio-repository'
import { definePlugin } from 'nitro'

// Nitro fires `close` once srvx has drained in-flight requests; only then may the pool go.
export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook('close', closeDb)
})
