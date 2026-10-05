import { IconBox, IconPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { ConsoleNavGroup } from './console-nav-group'
import { type CollapsedGroups, NAV_ICON_BUTTON, PROJECTS_GROUP, useNavProjects } from './lib'

/** Projects are data, not sections: the group grows with them and keeps a "new" door. */
export function ConsoleNavProjects({ collapsed, toggle }: CollapsedGroups) {
  const { items } = useNavProjects()

  return (
    <ConsoleNavGroup
      group={{ label: PROJECTS_GROUP, icon: IconBox, items }}
      counts={{}}
      isCollapsed={collapsed.has(PROJECTS_GROUP)}
      onToggle={() => toggle(PROJECTS_GROUP)}
      action={
        <Link
          to="/console/projects/new"
          aria-label="New project"
          title="New project"
          className={NAV_ICON_BUTTON}
        >
          <IconPlus className="size-3.5" stroke={2} />
        </Link>
      }
    />
  )
}
