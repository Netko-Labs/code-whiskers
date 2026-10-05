import {
  DEFAULT_KEY_LABEL,
  type ProjectUpdate,
  projectKeyTable,
  projectTable,
} from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { eq, sql, TransactionRollbackError } from 'drizzle-orm'
import type { ProjectSummary } from '../../queries/tracker/types'
import { newPublicKey } from '../../tracker/keys'
import type { ProjectSeed } from './types'

// Dev self-provisioning takes whatever id an SDK presents, so the sequence can land on a taken one.
const ID_ATTEMPTS = 5

/** A project and its first key, or nothing when the id or the key is already taken. */
export async function insertProject(seed: ProjectSeed) {
  try {
    return await insertProjectOnce(seed)
  } catch (error) {
    if (error instanceof TransactionRollbackError) return undefined
    throw error
  }
}

function insertProjectOnce(seed: ProjectSeed) {
  return db.transaction(async (tx) => {
    const [project] = await tx
      .insert(projectTable)
      .values({
        id: seed.id ?? sql`nextval('project_id_seq')::text`,
        name: seed.name,
        repository: seed.repository ?? null,
      })
      .onConflictDoNothing()
      .returning()
    if (!project) return undefined
    const [key] = await tx
      .insert(projectKeyTable)
      .values({ projectId: project.id, publicKey: seed.publicKey, label: DEFAULT_KEY_LABEL })
      .onConflictDoNothing()
      .returning()
    if (!key) return tx.rollback()
    return { project, key }
  })
}

export const createProject = async (
  name: string,
  repository: string | null = null,
): Promise<ProjectSummary> => {
  for (let attempt = 0; attempt < ID_ATTEMPTS; attempt += 1) {
    const created = await insertProject({ name, repository, publicKey: newPublicKey() })
    if (!created) continue
    const { project, key } = created
    return {
      id: project.id,
      name: project.name,
      repository: project.repository,
      createdAt: project.createdAt,
      keys: [key],
      issues: 0,
      lastEventAt: null,
    }
  }
  throw new Error('project was not stored')
}

export const updateProject = async (id: string, patch: ProjectUpdate) =>
  (await db.update(projectTable).set(patch).where(eq(projectTable.id, id)).returning())[0]

export const setProjectRepository = (id: string, repository: string | null) =>
  updateProject(id, { repository })
