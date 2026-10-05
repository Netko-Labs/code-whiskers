import { ProjectScopeSchema, ReleaseDetailQuerySchema } from '@code-whiskers/whiskers-domain'
import { getRelease, getReleases, getSuspectCommits } from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'
import { projectIdsOf } from '../shared'

/** Releases, their commits and deploys, for a reader. Deploys are written through `/api`. */
export const releaseRoutes = new Elysia({ name: 'releases', prefix: '/v1' })
  // (ﾉ≧∀≦)ﾉ what each release brought in, where it runs, what went into it
  .get('/releases', { query: ProjectScopeSchema }, ({ query }) =>
    getReleases(projectIdsOf(query.projectId)),
  )
  // (ﾉ≧∀≦)ﾉ one release; versions travel in the query, they may hold `/` or `@`
  .get('/releases/detail', { query: ReleaseDetailQuerySchema }, async ({ query, status }) => {
    const detail = await getRelease(query)
    return detail ?? status(404, { error: 'no such release' })
  })
  // (・_・ヾ commits of the issue's first release that touched its stack
  .get('/issues/:issueId/suspect-commits', async ({ params, status }) => {
    const suspects = await getSuspectCommits(params.issueId)
    return suspects ?? status(404, { error: 'no such issue' })
  })
