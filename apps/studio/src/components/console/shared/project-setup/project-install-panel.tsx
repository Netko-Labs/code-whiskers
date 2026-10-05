import { NativeSelect, NativeSelectOption } from '@code-whiskers/ui/components/native-select'
import { useState } from 'react'
import { DsnChip } from './dsn-chip'
import { FirstEventBar } from './first-event-bar'
import { InstallGuide } from './install-guide'
import {
  consoleOrigin,
  DEFAULT_PLATFORM,
  isPlatformId,
  PLATFORMS,
  type PlatformId,
  type ProjectInstallPanelProps,
  projectDsn,
} from './lib'

/** A project that has sent nothing yet: how to send something, and a listener for when it does. */
export function ProjectInstallPanel({ project }: ProjectInstallPanelProps) {
  const [platform, setPlatform] = useState<PlatformId>(DEFAULT_PLATFORM)
  const dsn = projectDsn(consoleOrigin(), project)

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="m-0 font-semibold text-[15px]">
            {project.name} has not sent anything yet
          </h2>
          <p className="m-0 text-[13px] text-muted-foreground">
            Add the SDK, or send a test event to check the pipe end to end.
          </p>
        </div>
        <NativeSelect
          aria-label="Platform"
          value={platform}
          onChange={(event) => {
            if (isPlatformId(event.target.value)) setPlatform(event.target.value)
          }}
        >
          {PLATFORMS.map((option) => (
            <NativeSelectOption key={option.id} value={option.id}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      {dsn ? (
        <>
          <DsnChip dsn={dsn} className="self-start" />
          <InstallGuide platform={platform} dsn={dsn} />
        </>
      ) : (
        <p className="m-0 text-[13px] text-muted-foreground">
          Every key is disabled — enable one in the project settings to get a DSN.
        </p>
      )}
      <FirstEventBar projectId={project.id} variant="inline" />
    </section>
  )
}
