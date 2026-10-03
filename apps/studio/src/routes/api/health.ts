import { studioEnvConfig } from '@code-whiskers/studio-config'
import { createFileRoute } from '@tanstack/react-router'
import { probe } from '@/shared/health'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        const startTime = Date.now()
        const database = await probe(
          'database',
          import('@code-whiskers/studio-repository').then(({ db, sql }) =>
            db.execute(sql`SELECT 1`),
          ),
        )
        const isHealthy = database === 'connected'
        // Coolify's healthcheck reads the status code, not the body.
        return Response.json(
          {
            status: isHealthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime: Date.now() - startTime,
            release: studioEnvConfig.observability.release,
            environment: studioEnvConfig.observability.environment,
            checks: { database },
          },
          { status: isHealthy ? 200 : 503 },
        )
      },
    },
  },
})
