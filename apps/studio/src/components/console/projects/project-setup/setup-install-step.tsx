import { Button } from '@code-whiskers/ui/components/button'
import { InstallGuide } from '../../shared/project-setup'
import type { SetupInstallStepProps } from './lib'

export function SetupInstallStep({ platform, dsn, onNext }: SetupInstallStepProps) {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="m-0 font-semibold text-[20px] tracking-[-0.015em]">Install</h1>
        <p className="m-0 text-[13px] text-muted-foreground">
          The DSN is filled in. Keep it in the environment; inline works too.
        </p>
      </header>
      <InstallGuide platform={platform} dsn={dsn} />
      <Button size="sm" className="self-start" onClick={onNext}>
        Next: verify
      </Button>
    </div>
  )
}
