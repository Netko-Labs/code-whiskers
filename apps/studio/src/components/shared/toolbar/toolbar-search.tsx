import { cn } from '@code-whiskers/ui/lib/utils'
import { IconSearch, IconX } from '@tabler/icons-react'
import { useCallback, useRef } from 'react'
import { Shortcut } from '@/components/shared/kbd'
import { isTyping, useDocumentKeydown } from '@/shared/dom-events'
import { SEARCH_FOCUS_KEY, type ToolbarSearchProps } from './lib'

/** Controlled: the caller owns the value (usually the URL) and any debounce. */
export function ToolbarSearch({
  value,
  onValueChange,
  placeholder,
  focusKey = SEARCH_FOCUS_KEY,
  className,
}: ToolbarSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const focus = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== focusKey || isTyping(event.target) || event.metaKey || event.ctrlKey) return
      event.preventDefault()
      inputRef.current?.focus()
    },
    [focusKey],
  )
  useDocumentKeydown(focus, focusKey !== null)

  return (
    <label
      className={cn(
        'group/search flex h-7 w-[240px] items-center gap-2 rounded-md border border-border bg-background px-2 transition-colors focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/20',
        className,
      )}
    >
      <IconSearch className="size-3.5 shrink-0 text-muted-foreground" stroke={1.75} />
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') event.currentTarget.blur()
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-ui outline-none placeholder:text-faint"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onValueChange('')}
          aria-label="Clear search"
          className="focus-ring rounded-sm text-muted-foreground hover:text-foreground"
        >
          <IconX className="size-3.5" stroke={1.75} />
        </button>
      ) : (
        focusKey && <Shortcut keys={[focusKey]} className="group-focus-within/search:hidden" />
      )}
    </label>
  )
}
