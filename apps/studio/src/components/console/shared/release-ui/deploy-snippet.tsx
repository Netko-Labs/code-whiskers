import { cn } from '@code-whiskers/ui/lib/utils'
import { CodeBlock, consoleOrigin, primaryKeyOf } from '../project-setup'
import { DEPLOY_SHA_VARIABLE, type DeploySnippetProps, deployCurl } from './lib'

/** The one line a deploy step runs; it uses the project's first enabled client key. */
export function DeploySnippet({ project, className }: DeploySnippetProps) {
  const key = primaryKeyOf(project)

  if (!key) {
    return (
      <p className={cn('m-0 text-muted-foreground text-ui', className)}>
        Enable a client key first: deploys authenticate with one.
      </p>
    )
  }
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <CodeBlock
        snippet={{
          label: 'Report a deploy',
          code: deployCurl(consoleOrigin(), project.id, key.publicKey),
        }}
      />
      <p className="m-0 text-2xs text-muted-foreground">
        Coolify sets <code className="font-mono">{DEPLOY_SHA_VARIABLE}</code>; in GitHub Actions use{' '}
        <code className="font-mono">GITHUB_SHA</code>. Optional fields: <code>url</code>,{' '}
        <code>name</code>, <code>repository</code>.
      </p>
    </div>
  )
}
