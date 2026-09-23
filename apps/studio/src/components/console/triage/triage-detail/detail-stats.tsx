import type { ConsoleItem } from '../../shared/console-model'

const CELL = 'flex flex-col gap-[3px] border-rule-soft border-r px-5 py-[13px]'

export function DetailStats({ item, owner }: { item: ConsoleItem; owner: string }) {
  return (
    <div className="grid shrink-0 grid-cols-[repeat(auto-fit,minmax(150px,1fr))] border-border border-b">
      <div className={CELL}>
        <span className="text-[11px] text-muted-foreground">Events</span>
        <span className="font-mono font-semibold text-base">{item.events}</span>
      </div>
      <div className={CELL}>
        <span className="text-[11px] text-muted-foreground">Users</span>
        <span className="font-mono font-semibold text-base">{item.users}</span>
      </div>
      <div className={CELL}>
        <span className="text-[11px] text-muted-foreground">Last seen</span>
        <span className="font-mono font-semibold text-base">{item.age} ago</span>
      </div>
      <div className="flex flex-col gap-[3px] px-5 py-[13px]">
        <span className="text-[11px] text-muted-foreground">Owner</span>
        <span className="font-medium text-sm">{owner}</span>
      </div>
    </div>
  )
}
