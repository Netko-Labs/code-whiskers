import { LOG_LEVEL_CLASS, LOG_LINES, LOGS_LABEL, LOGS_RATE, LOGS_SOURCES, LOGS_TAIL } from './lib'

export function ShowcaseLogs() {
  return (
    <article className="col-span-full flex flex-col overflow-x-auto whitespace-nowrap rounded-[14px] border border-ink-hairline bg-ink-card px-4 pt-3 pb-3.5 font-mono text-xs leading-[1.8] text-ink-muted">
      <header className="mb-1.5 flex flex-wrap items-center gap-2.5 border-b border-ink-hairline pb-2 text-[11px] text-ash">
        <span className="font-sans font-semibold tracking-[0.12em] text-severity-info">
          {LOGS_LABEL}
        </span>
        <span className="font-sans">{LOGS_RATE}</span>
        {LOGS_SOURCES.map((source) => (
          <span key={source}>
            <span className="text-severity-resolved">●</span> {source}
          </span>
        ))}
        <span className="ml-auto">{LOGS_TAIL}</span>
      </header>
      {LOG_LINES.map((line) => (
        <div key={line.time}>
          <span className="text-ink-text">{line.time}</span>
          {'  '}
          <span className={LOG_LEVEL_CLASS[line.level]}>{line.level.padEnd(5)}</span>{' '}
          {line.source.padEnd(7)}
          {line.text}
          {line.meta && <span className="text-ash"> {line.meta}</span>}
        </div>
      ))}
    </article>
  )
}
