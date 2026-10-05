import { Avatar, AvatarFallback, AvatarImage } from '@code-whiskers/ui/components/avatar'
import type { CommitAuthorProps } from './lib'

export function CommitAuthor({ name, login, avatar }: CommitAuthorProps) {
  return (
    <span className="flex min-w-0 items-center gap-1.5" title={login ? `@${login}` : name}>
      <Avatar size="sm" className="size-4">
        {avatar && <AvatarImage src={avatar} alt="" />}
        <AvatarFallback className="text-[9px]">{name.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="truncate text-muted-foreground">{login ?? name}</span>
    </span>
  )
}
