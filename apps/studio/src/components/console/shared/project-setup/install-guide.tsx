import { CodeBlock } from './code-block'
import { type InstallGuideProps, snippetsFor } from './lib'

/** Install, configure, prove it: the DSN is already in every snippet. */
export function InstallGuide({ platform, dsn }: InstallGuideProps) {
  const snippets = snippetsFor(platform, dsn)
  const steps = [
    snippets.install && { title: 'Install the SDK', blocks: [snippets.install] },
    {
      title: snippets.init ? 'Point it at this project' : 'Point the exporter at this project',
      blocks: [snippets.env, ...(snippets.init ? [snippets.init] : [])],
    },
    snippets.verify && { title: 'Send something', blocks: [snippets.verify] },
  ].filter((step) => !!step)

  return (
    <ol className="m-0 flex list-none flex-col gap-6 p-0">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-3.5">
          <span className="mt-px flex size-[22px] shrink-0 items-center justify-center rounded-full border border-border font-mono text-[11px] text-muted-foreground">
            {index + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <h3 className="m-0 font-medium text-[14px]">{step.title}</h3>
            {step.blocks.map((block) => (
              <CodeBlock key={block.label} snippet={block} />
            ))}
          </div>
        </li>
      ))}
      {snippets.note && (
        <li className="m-0 pl-9 text-[13px] text-muted-foreground">{snippets.note}</li>
      )}
    </ol>
  )
}
