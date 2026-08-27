import {
  type ChatMessage,
  type ChatMessageInsert,
  chatMessageTable,
} from '@code-whiskers/realtime-domain'
import { db } from '@code-whiskers/realtime-repository'

export const createChatMessage = async (
  data: ChatMessageInsert,
): Promise<ChatMessage | undefined> => {
  return await db
    .insert(chatMessageTable)
    .values(data)
    .returning()
    .then(([r]) => r)
}
