import { useTheme } from '@code-whiskers/ui/components/theme'
import {
  IconBox,
  IconKeyboard,
  IconLayoutSidebar,
  IconMoon,
  IconPlus,
  IconSun,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'
import { whiskersProjectsQuery } from '@/integrations/whiskers'
import { NAV_GROUPS, NAV_PRIMARY, SETTINGS_NAV } from '../../../shared/console-data'
import { useConsoleStore } from '../../../use-console-store'
import type { PaletteCommand } from '../types'
import { goShortcut } from '../utils'
import { useIssueCommands } from './use-issue-commands'

/** Every page, project and action as one list; issues join once the query is long enough. */
export function usePaletteCommands(query: string): PaletteCommand[] {
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()
  const { data: projects } = useQuery({ ...whiskersProjectsQuery(), retry: false })
  const close = useCallback(() => useConsoleStore.getState().setPaletteOpen(false), [])
  const issues = useIssueCommands(query, close)

  const commands = useMemo(() => {
    const go = (to: string, params?: Record<string, string>) => () => {
      close()
      void navigate({ to, params })
    }
    const pages: PaletteCommand[] = [
      ...NAV_PRIMARY,
      ...NAV_GROUPS.flatMap((group) => group.items),
    ].map((item) => ({
      id: `go:${item.to}:${JSON.stringify(item.params ?? {})}`,
      group: 'Go to',
      label: item.label,
      icon: item.icon,
      shortcut: goShortcut(item.label),
      run: go(item.to, item.params),
    }))
    const listed = new Set(pages.map((page) => page.label))
    const settings: PaletteCommand[] = SETTINGS_NAV.flatMap((group) => group.entries)
      .filter((entry) => !listed.has(entry.label))
      .map((entry) => ({
        id: `go:${entry.to}`,
        group: 'Go to',
        label: entry.isElsewhere ? entry.label : `${entry.label} settings`,
        icon: entry.icon,
        keywords: ['settings', 'preferences'],
        run: go(entry.to),
      }))
    const projectCommands: PaletteCommand[] = (projects ?? []).map((project) => ({
      id: `project:${project.id}`,
      group: 'Projects',
      label: project.name,
      icon: IconBox,
      hint: project.repository ?? undefined,
      keywords: ['project', 'settings', 'dsn'],
      run: go('/console/projects/$projectId', { projectId: project.id }),
    }))
    const isDark = resolvedTheme === 'dark'
    const actions: PaletteCommand[] = [
      {
        id: 'action:new-project',
        group: 'Actions',
        label: 'Create a project',
        icon: IconPlus,
        keywords: ['new', 'dsn', 'sentry', 'setup'],
        shortcut: ['g', 'n'],
        run: go('/console/projects/new'),
      },
      {
        id: 'action:theme',
        group: 'Actions',
        label: isDark ? 'Switch to light theme' : 'Switch to dark theme',
        icon: isDark ? IconSun : IconMoon,
        keywords: ['theme', 'appearance', 'dark', 'light'],
        run: () => {
          close()
          setTheme(isDark ? 'light' : 'dark')
        },
      },
      {
        id: 'action:sidebar',
        group: 'Actions',
        label: 'Toggle the sidebar',
        icon: IconLayoutSidebar,
        shortcut: ['['],
        run: () => {
          close()
          useConsoleStore.getState().toggleNav()
        },
      },
      {
        id: 'action:shortcuts',
        group: 'Actions',
        label: 'Keyboard shortcuts',
        icon: IconKeyboard,
        shortcut: ['?'],
        run: () => useConsoleStore.getState().setShortcutsOpen(true),
      },
    ]
    return [...pages, ...settings, ...projectCommands, ...actions]
  }, [projects, resolvedTheme, setTheme, navigate, close])

  return useMemo(() => [...issues, ...commands], [issues, commands])
}
