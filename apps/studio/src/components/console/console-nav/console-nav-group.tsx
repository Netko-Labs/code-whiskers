import { ConsoleNavItem } from './console-nav-item'
import { type ConsoleNavGroupProps, NAV_GROUP_LABEL } from './lib'

export function ConsoleNavGroup({ group }: ConsoleNavGroupProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={NAV_GROUP_LABEL}>{group.label}</span>
      {group.items.map((item) => (
        <ConsoleNavItem key={item.label} item={item} />
      ))}
    </div>
  )
}
