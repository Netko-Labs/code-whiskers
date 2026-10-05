import { IconSearch, IconX } from '@tabler/icons-react'
import { Shortcut } from '@/components/shared/kbd'
import { QUERY_HINT } from '../lib'
import { type LogsQueryInputProps, useQueryInput } from './lib'

/** One field for text and `key:value` filters; Enter turns filters into chips. */
export function LogsQueryInput({ initial, onSubmit }: LogsQueryInputProps) {
  const input = useQueryInput(initial, onSubmit)

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        input.submit()
      }}
      className="group/search flex h-7 min-w-[240px] flex-1 items-center gap-2 rounded-md border border-border bg-background px-2 transition-colors focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/20"
    >
      <IconSearch className="size-3.5 shrink-0 text-muted-foreground" stroke={1.75} />
      <input
        ref={input.inputRef}
        value={input.draft}
        onChange={(event) => input.setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') event.currentTarget.blur()
        }}
        placeholder={QUERY_HINT}
        aria-label="Search logs"
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none placeholder:font-sans placeholder:text-faint placeholder:text-ui"
      />
      {input.draft ? (
        <button
          type="button"
          onClick={input.clear}
          aria-label="Clear search"
          className="focus-ring rounded-sm text-muted-foreground hover:text-foreground"
        >
          <IconX className="size-3.5" stroke={1.75} />
        </button>
      ) : (
        <Shortcut keys={['/']} className="group-focus-within/search:hidden" />
      )}
    </form>
  )
}
