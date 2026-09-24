import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  alertRulesQuery,
  instanceQuery,
  integrationsQuery,
  organizationsQuery,
  repositoriesQuery,
  rulesQuery,
} from '@/integrations/studio-api'
import { whiskersInstanceQuery } from '@/integrations/whiskers'
import type { SetupStep } from '../types'

/** What a fresh self-hosted instance still needs, read from what each source already holds. */
export function useSetupSteps(): SetupStep[] {
  const { data: orgs } = useQuery({ ...organizationsQuery(), retry: false })
  const { data: repos } = useQuery({ ...repositoriesQuery(), retry: false })
  const { data: worker } = useQuery({ ...whiskersInstanceQuery(), retry: false })
  const { data: hooks } = useQuery({ ...integrationsQuery(), retry: false })
  const { data: alerts } = useQuery({ ...alertRulesQuery(), retry: false })
  const { data: rules } = useQuery({ ...rulesQuery(), retry: false })
  const { data: instance } = useQuery({ ...instanceQuery(), retry: false })

  return useMemo(() => {
    const rows = (table: string) => worker?.stores.find((s) => s.table === table)?.rows ?? 0
    return [
      {
        step: 'Install the GitHub App',
        isDone: (orgs?.length ?? 0) > 0,
        how: 'Install it on the organizations whose pull requests should be reviewed',
        link: instance ? { kind: 'external', href: instance.githubApp.installUrl } : null,
      },
      {
        step: 'Sync repositories',
        isDone: (repos?.length ?? 0) > 0,
        how: 'Repositories → Sync from GitHub',
        link: { kind: 'section', section: 'repositories' },
      },
      {
        step: 'Get a first review',
        isDone: rows('review') > 0,
        how: 'Open or push to a pull request in a watched repository',
        link: { kind: 'section', section: 'pull-requests' },
      },
      {
        step: 'Create an error-ingest project',
        isDone: rows('project') > 0,
        how: 'Integrations → Create project, then pass the DSN to Sentry.init',
        link: { kind: 'section', section: 'integrations', tab: 1 },
      },
      {
        step: 'Receive a first error',
        isDone: rows('event') > 0,
        how: 'Throw something in an app that has the DSN',
        link: { kind: 'section', section: 'issues' },
      },
      {
        step: 'Send logs or traces',
        isDone: rows('log_line') + rows('span') > 0,
        how: 'Point an OTLP exporter at /otlp with http/json and the project key',
        link: { kind: 'section', section: 'live-logs' },
      },
      {
        step: 'Add a webhook',
        isDone: (hooks?.length ?? 0) > 0,
        how: 'Integrations → Add webhook (Slack, Discord or any HTTPS endpoint)',
        link: { kind: 'section', section: 'integrations' },
      },
      {
        step: 'Arm an alert rule',
        isDone: (alerts?.length ?? 0) > 0,
        how: 'Alert rules → New alert rule',
        link: { kind: 'section', section: 'alert-rules' },
      },
      {
        step: 'Write a review rule',
        isDone: (rules?.length ?? 0) > 0,
        how: 'Optional — tell the reviewer what your team cares about',
        link: { kind: 'section', section: 'review-rules' },
      },
    ]
  }, [orgs, repos, worker, hooks, alerts, rules, instance])
}
