import { cn } from '@code-whiskers/ui/lib/utils'
import { useState } from 'react'
import { matchesPlatform, PLATFORM_GROUPS, PLATFORMS, type PlatformGridProps } from './lib'
import { PlatformMark } from './platform-mark'

/** Dense and filterable: most people type two letters and press the one tile left. */
export function PlatformGrid({ value, onChange }: PlatformGridProps) {
  const [query, setQuery] = useState('')
  const shown = PLATFORMS.filter((platform) => matchesPlatform(platform, query))

  return (
    <div className="flex flex-col gap-4">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filter platforms…"
        aria-label="Filter platforms"
        className="h-8 w-full max-w-[320px] rounded-[10px] border border-border bg-transparent px-2.5 text-[13px] outline-none placeholder:text-faint focus-visible:border-ring"
      />
      {PLATFORM_GROUPS.map((group) => {
        const platforms = shown.filter((platform) => platform.group === group)
        if (platforms.length === 0) return null
        return (
          <section key={group} className="flex flex-col gap-2">
            <h3 className="m-0 font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.12em]">
              {group}
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  aria-pressed={platform.id === value}
                  onClick={() => onChange(platform.id)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left text-[13px] transition-colors',
                    platform.id === value
                      ? 'border-foreground bg-surface-subtle font-medium'
                      : 'border-border hover:bg-surface-subtle',
                  )}
                >
                  <PlatformMark platform={platform} />
                  <span className="min-w-0 truncate">{platform.label}</span>
                </button>
              ))}
            </div>
          </section>
        )
      })}
      {shown.length === 0 && (
        <p className="m-0 text-[13px] text-muted-foreground">
          No match — pick Other / Sentry-compatible; any Sentry SDK works.
        </p>
      )}
    </div>
  )
}
