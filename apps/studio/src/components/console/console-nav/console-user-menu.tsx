import { Popover, PopoverContent, PopoverTrigger } from '@code-whiskers/ui/components/popover'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconKeyboard, IconLogout } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Shortcut } from '@/components/shared/kbd'
import { signOut } from '@/integrations/auth'
import { useViewer } from '../shared/console-data'
import { PersonAvatar } from '../shared/console-ui'
import { useConsoleStore } from '../use-console-store'
import { MENU_ROW, USER_MENU, type UserMenuProps } from './lib'
import { ThemePicker } from './theme-picker'

export function ConsoleUserMenu({ isCompact = false }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const viewer = useViewer()
  const name = viewer?.name ?? ''

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Account"
        className={cn(
          'focus-ring flex min-w-0 items-center gap-2 rounded-md transition-colors hover:bg-sidebar-accent aria-expanded:bg-sidebar-accent',
          isCompact ? 'size-9 justify-center' : 'h-9 w-full px-1.5',
        )}
      >
        <PersonAvatar name={name} image={viewer?.image} isSelf className="size-6 text-[9px]" />
        {!isCompact && (
          <span className="min-w-0 flex-1 truncate text-left font-medium text-ui">{name}</span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side={isCompact ? 'right' : 'top'}
        sideOffset={8}
        className="w-[260px] gap-0 p-1"
      >
        <div className="flex flex-col px-2 pt-1.5 pb-2">
          <span className="truncate font-semibold text-ui">{name}</span>
          <span className="truncate text-2xs text-muted-foreground">{viewer?.email}</span>
        </div>
        <ThemePicker />
        <div className="my-1 h-px bg-border" />
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            useConsoleStore.getState().setShortcutsOpen(true)
          }}
          className={MENU_ROW}
        >
          <IconKeyboard className="size-4 text-muted-foreground" stroke={1.75} />
          <span className="flex-1">Keyboard shortcuts</span>
          <Shortcut keys={['?']} />
        </button>
        {USER_MENU.map((entry) => (
          <button
            type="button"
            key={entry.label}
            onClick={() => {
              setOpen(false)
              navigate({ to: '/console/$section', params: { section: entry.section } })
            }}
            className={MENU_ROW}
          >
            <entry.icon className="size-4 text-muted-foreground" stroke={1.75} />
            {entry.label}
          </button>
        ))}
        <div className="my-1 h-px bg-border" />
        <button
          type="button"
          onClick={() => void signOut().then(() => navigate({ to: '/sign-in' }))}
          className={MENU_ROW}
        >
          <IconLogout className="size-4 text-muted-foreground" stroke={1.75} />
          Sign out
        </button>
      </PopoverContent>
    </Popover>
  )
}
