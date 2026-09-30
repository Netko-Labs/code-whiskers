import { isBotLogin } from '../fix'
import { findingTitleOf } from '../mentions'
import { REACTION_COMMANDS } from './constants'
import type { PendingReaction, ReactionContent, ScannedComment } from './types'

const MARKER = /<!-- cw:reaction:(-1|rocket|confused) -->/g

/** Hidden in the bot's reply on the thread: that reaction was handled, never act on it twice. */
export function reactionMarker(content: ReactionContent): string {
  return `\n\n<!-- cw:reaction:${content} -->`
}

/**
 * Command reactions on the bot's own finding comments that no bot reply in the thread has
 * handled yet. Counts only — who reacted is checked afterwards, and only for these.
 */
export function pendingReactions(
  comments: ScannedComment[],
  botHandle: string,
  resolvedRoots: ReadonlySet<number> = new Set(),
): PendingReaction[] {
  const handled = new Map<number, Set<string>>()
  for (const comment of comments) {
    if (comment.inReplyToId === null || !isBotLogin(comment.author, botHandle)) continue
    const seen = handled.get(comment.inReplyToId) ?? new Set<string>()
    for (const match of comment.body.matchAll(MARKER)) if (match[1]) seen.add(match[1])
    handled.set(comment.inReplyToId, seen)
  }

  return comments
    .filter((c) => c.inReplyToId === null && isBotLogin(c.author, botHandle))
    .filter((c) => findingTitleOf(c.body) !== null)
    .flatMap((root) =>
      (Object.keys(REACTION_COMMANDS) as ReactionContent[])
        .filter((content) => (root.reactions[content] ?? 0) > 0)
        .filter((content) => !handled.get(root.id)?.has(content))
        // A 👎 resolves silently; a resolved thread is its "handled" mark.
        .filter((content) => !(content === '-1' && resolvedRoots.has(root.id)))
        .map((content) => ({
          rootId: root.id,
          path: root.path,
          line: root.line,
          content,
          command: REACTION_COMMANDS[content],
        })),
    )
}
