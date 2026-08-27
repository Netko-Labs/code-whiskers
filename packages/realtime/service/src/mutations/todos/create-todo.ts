import { type Todo, type TodoInsert, todoTable } from '@code-whiskers/realtime-domain'
import { db } from '@code-whiskers/realtime-repository'

export const createTodo = async (data: TodoInsert): Promise<Todo | undefined> => {
  return await db
    .insert(todoTable)
    .values(data)
    .returning()
    .then(([r]) => r)
}
