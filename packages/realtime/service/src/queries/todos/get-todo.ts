import { type Todo, todoTable } from '@code-whiskers/realtime-domain'
import { db } from '@code-whiskers/realtime-repository'
import { eq } from 'drizzle-orm'

export const getTodo = async (todoId: string): Promise<Todo | undefined> => {
  return await db
    .select()
    .from(todoTable)
    .where(eq(todoTable.id, todoId))
    .then(([r]) => r)
}
