import { createLogger } from '@code-whiskers/logger'
import { DeployBodySchema } from '@code-whiskers/whiskers-domain'
import { recordDeploy, resolveProject } from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'
import { clientKeyFrom } from '../shared'

const logger = createLogger('whiskers-deploys')

/** CI and Coolify report deploys with a project client key, the same one SDKs ingest with. */
export const deployRoutes = new Elysia({ name: 'deploys', prefix: '/api' })
  // ┬─┬ノ( º _ ºノ) a release went out to an environment
  .post(
    '/:projectId/deploys',
    { body: DeployBodySchema },
    async ({ request, params, query, body, status }) => {
      const project = await resolveProject(params.projectId, clientKeyFrom(request, query))
      if (!project) return status(401, { error: 'unknown project or bad client key' })
      const outcome = await recordDeploy(project, body)
      if (!outcome.ok) return status(422, { error: outcome.error })
      logger.info(
        { projectId: project.id, version: outcome.version, environment: outcome.environment },
        'deploy recorded',
      )
      return status(201, {
        id: outcome.deployId,
        release: outcome.version,
        environment: outcome.environment,
      })
    },
  )
