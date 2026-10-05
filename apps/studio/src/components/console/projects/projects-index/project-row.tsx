import { IconBox } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import {
  DataRow,
  DataRowDescription,
  DataRowLead,
  DataRowMeta,
  DataRowTitle,
  DataRowTrail,
} from '@/components/shared/data-list'
import { formatAge } from '@/shared/format-date'
import { enabledKeys, type ProjectRowProps } from './lib'

export function ProjectRow({ project }: ProjectRowProps) {
  const keys = enabledKeys(project)

  return (
    <DataRow
      density="auto"
      render={<Link to="/console/projects/$projectId" params={{ projectId: project.id }} />}
    >
      <DataRowLead>
        <IconBox stroke={1.75} />
      </DataRowLead>
      <span className="flex min-w-0 flex-1 flex-col">
        <DataRowTitle>{project.name}</DataRowTitle>
        <DataRowDescription className="font-mono text-2xs">
          {project.repository ?? 'no repository'} · #{project.id}
        </DataRowDescription>
      </span>
      <DataRowTrail className="gap-5">
        <DataRowMeta className="hidden w-16 text-right sm:block">
          {keys} {keys === 1 ? 'key' : 'keys'}
        </DataRowMeta>
        <DataRowMeta className="w-20 text-right text-foreground">
          {project.issues.toLocaleString()} {project.issues === 1 ? 'issue' : 'issues'}
        </DataRowMeta>
        <DataRowMeta className="w-24 text-right">
          {project.lastEventAt ? `${formatAge(project.lastEventAt)} ago` : 'no events yet'}
        </DataRowMeta>
      </DataRowTrail>
    </DataRow>
  )
}
