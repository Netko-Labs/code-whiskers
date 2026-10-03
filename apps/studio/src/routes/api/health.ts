import { createFileRoute } from '@tanstack/react-router'
import { probe } from '@/shared/health'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        const startTime = Date.now()
        const { db, sql } = await import('@code-whiskers/studio-repository')
        const database = await probe('database', db.execute(sql`SELECT 1`))
        const isHealthy = database === 'connected'
        // Coolify's healthcheck reads the status code, not the body.
        return Response.json(
          {
            status: isHealthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime: Date.now() - startTime,
            checks: { database },
          },
          { status: isHealthy ? 200 : 503 },
        )
      },
    },
  },
})
