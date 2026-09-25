import { ConsoleNavItem } from './console-nav-item'
import { type ConsoleNavGroupProps, countFor, NAV_GROUP_LABEL } from './lib'

export function ConsoleNavGroup({ group, counts }: ConsoleNavGroupProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {group.kind !== 'primary' && <span className={NAV_GROUP_LABEL}>{group.label}</span>}
      {group.items.map((item) => (
        <ConsoleNavItem
          key={item.label}
          item={item}
          count={group.kind === 'primary' ? countFor(counts, item) : ''}
          isQuiet={group.kind !== 'primary'}
        />
      ))}
    </div>
  )
}
