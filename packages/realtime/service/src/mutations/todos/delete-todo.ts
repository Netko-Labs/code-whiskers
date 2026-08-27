import { type Todo, todoTable } from '@code-whiskers/realtime-domain'
import { db } from '@code-whiskers/realtime-repository'
import { eq } from 'drizzle-orm'

export const deleteTodo = async (todoId: string): Promise<Todo | undefined> => {
  return await db
    .delete(todoTable)
    .where(eq(todoTable.id, todoId))
    .returning()
    .then(([r]) => r)
}
