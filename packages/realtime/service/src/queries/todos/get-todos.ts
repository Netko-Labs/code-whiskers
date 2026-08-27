import { type Todo, todoTable } from '@code-whiskers/realtime-domain'
import { db } from '@code-whiskers/realtime-repository'

export const getTodos = async (): Promise<Todo[]> => {
  return await db.select().from(todoTable)
}
