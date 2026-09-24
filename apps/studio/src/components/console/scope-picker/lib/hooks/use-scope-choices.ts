import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { repositoriesQuery } from '@/integrations/studio-api'
import { whiskersProjectsQuery } from '@/integrations/whiskers'
import { useConsoleItems } from '../../../shared/console-data'
import { projectScopeValue, repositoryName, useConsoleScope } from '../../../shared/console-scope'
import { useConsoleStore } from '../../../use-console-store'
import type { ScopeChoice, ScopeChoices } from '../types'

function tally(keys: (string | null | undefined)[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const key of keys) if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
  return counts
}

/** Repositories from the GitHub sync plus any a review names; projects only when unlinked. */
export function useScopeChoices(): ScopeChoices {
  const navigate = useNavigate()
  const scope = useConsoleScope()
  const orgLogin = useConsoleStore((s) => s.orgLogin)
  const { items, sample } = useConsoleItems()
  const { data: synced } = useQuery({ ...repositoriesQuery(), retry: false })
  const { data: projects } = useQuery({ ...whiskersProjectsQuery(), retry: false })

  return useMemo(() => {
    const live = sample ? [] : items
    const byRepository = tally(live.map((item) => item.repository?.toLowerCase()))
    const byProject = tally(live.map((item) => item.projectId))
    const inOrg = (slug: string) =>
      !orgLogin || slug.toLowerCase().startsWith(`${orgLogin.toLowerCase()}/`)

    const slugs = new Map<string, string>()
    for (const repo of synced ?? [])
      slugs.set(`${repo.owner}/${repo.name}`.toLowerCase(), `${repo.owner}/${repo.name}`)
    for (const item of live)
      if (item.repository) slugs.set(item.repository.toLowerCase(), item.repository)

    const repositories: ScopeChoice[] = [...slugs.values()]
      .filter(inOrg)
      .map((slug) => ({
        value: slug,
        kind: 'repository' as const,
        label: repositoryName(slug),
        detail: slug,
        count: byRepository.get(slug.toLowerCase()) ?? 0,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

    const unlinked: ScopeChoice[] = (projects ?? [])
      .filter((project) => !project.repository)
      .map((project) => ({
        value: projectScopeValue(project.id),
        kind: 'project' as const,
        label: project.name,
        detail: `project ${project.id} · no repository`,
        count: byProject.get(project.id) ?? 0,
      }))

    const all: ScopeChoice = {
      value: null,
      kind: 'all',
      label: 'All repositories',
      detail: 'Everything this instance sees',
      count: live.length,
    }
    const current =
      [...repositories, ...unlinked].find(
        (choice) => choice.value?.toLowerCase() === scope.value?.toLowerCase(),
      ) ?? (scope.value ? { ...all, value: scope.value, label: scope.label } : all)

    return {
      repositories,
      projects: unlinked,
      all,
      current,
      pick: (value) =>
        navigate({ to: '.', search: (prev) => ({ ...prev, scope: value ?? undefined }) }),
    }
  }, [items, sample, synced, projects, orgLogin, scope, navigate])
}
