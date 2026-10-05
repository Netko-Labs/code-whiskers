import type { EditorCardProps } from './lib'

/** One step of the WHEN → IF → THEN stack: an icon chip, the step word, then its fields. */
export function EditorCard({ step, title, description, icon, children }: EditorCardProps) {
  return (
    <section className="flex animate-enter-up flex-col rounded-xl border border-border bg-card shadow-raised">
      <header className="flex items-start gap-3 border-border border-b px-4 py-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-surface-subtle text-muted-foreground [&_svg]:size-3.5">
          {icon}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="m-0 text-ui">
            <span className="font-mono text-2xs text-muted-foreground uppercase tracking-[0.12em]">
              {step}
            </span>{' '}
            <span className="font-semibold text-foreground">{title}</span>
          </h2>
          {description && <p className="m-0 text-2xs text-muted-foreground">{description}</p>}
        </div>
      </header>
      <div className="flex flex-col gap-4 p-4">{children}</div>
    </section>
  )
}

/** The hairline between two cards, with a node where the flow passes through. */
export function StepConnector() {
  return (
    <div aria-hidden className="relative mx-auto flex h-7 w-px flex-col items-center bg-border">
      <span className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full border border-border bg-background" />
    </div>
  )
}
