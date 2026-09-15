import { Button } from '@code-whiskers/ui/components/button'
import {
  ERROR_ASSIGN,
  ERROR_EVENTS,
  ERROR_EVENTS_LABEL,
  ERROR_LABEL,
  ERROR_LOCATION,
  ERROR_OPEN,
  ERROR_RESOLVE,
  ERROR_SOURCE,
  ERROR_SPARK,
  ERROR_TITLE,
  ERROR_USERS,
  ERROR_USERS_LABEL,
} from './lib'

export function ShowcaseErrorCard() {
  return (
    <article className="flex flex-col overflow-hidden rounded-[14px] border border-hairline bg-paper text-ink">
      <header className="flex items-center gap-2 whitespace-nowrap border-b border-hairline px-3.5 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-severity-error">
        {ERROR_LABEL}
        <span className="ml-auto text-xs font-normal tracking-normal text-ash">{ERROR_SOURCE}</span>
      </header>
      <div className="flex flex-1 flex-col justify-between gap-2.5 px-3.5 pt-3 pb-3.5">
        <div className="flex flex-col gap-0.5 text-[13px]">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-severity-error" />
            <span className="font-mono text-xs font-semibold">{ERROR_TITLE}</span>
          </div>
          <span className="pl-4 font-mono text-xs text-ash">{ERROR_LOCATION}</span>
        </div>
        <div className="flex items-end gap-4">
          <div className="flex h-7 flex-1 items-end gap-[3px]">
            {ERROR_SPARK.map((bar, i) => (
              <div
                key={`${bar.height}-${i}`}
                className={`flex-1 rounded-sm ${bar.hot ? 'bg-severity-error' : 'bg-hairline'}`}
                style={{ height: `${bar.height}%` }}
              />
            ))}
          </div>
          <div className="flex gap-3.5 whitespace-nowrap text-xs text-ash">
            <span>
              <strong className="text-ink tabular-nums">{ERROR_EVENTS}</strong>
              {ERROR_EVENTS_LABEL}
            </span>
            <span>
              <strong className="text-ink tabular-nums">{ERROR_USERS}</strong>
              {ERROR_USERS_LABEL}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-ink text-paper hover:bg-ink/90">
            {ERROR_OPEN}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-hairline bg-paper text-ink hover:bg-fog"
          >
            {ERROR_ASSIGN}
          </Button>
          <Button size="sm" variant="ghost" className="text-ink hover:bg-fog">
            {ERROR_RESOLVE}
          </Button>
        </div>
      </div>
    </article>
  )
}
